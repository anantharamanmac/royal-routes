import * as admin from "firebase-admin";
import {
  onDocumentUpdated,
  onDocumentCreated,
} from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";

// ─── Init ─────────────────────────────────────────────────────────────────────

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  role: "master_admin" | "destination_admin" | "viewer";
  assignedDestinationIds: string[];
  tripIds: string[];
  status: "active" | "disabled" | "invited";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AssignmentDoc {
  tripId: string;
  destinationId: string;
  assignedAdminId: string;
  title: string;
  deadline: Timestamp | null;
  priority: string;
  status: string;
  reviewComment?: string;
}

interface ItineraryDayDoc {
  tripId: string;
  destinationId: string;
  status: string;
}

// ─── Notification Helper ──────────────────────────────────────────────────────

async function createNotification(params: {
  userId: string;
  tripId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  await db.collection("notifications").add({
    userId: params.userId,
    tripId: params.tripId,
    type: params.type,
    title: params.title,
    message: params.message,
    isRead: false,
    link: params.link ?? null,
    createdAt: Timestamp.now(),
  });
}

async function createActivityLog(params: {
  tripId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}): Promise<void> {
  await db.collection("activityLogs").add({
    tripId: params.tripId,
    action: params.action,
    performedBy: params.performedBy,
    performedByName: params.performedByName,
    targetType: params.targetType ?? null,
    targetId: params.targetId ?? null,
    details: params.details ?? null,
    createdAt: Timestamp.now(),
  });
}

async function getMasterAdminIds(): Promise<string[]> {
  const snap = await db
    .collection("users")
    .where("role", "==", "master_admin")
    .where("status", "==", "active")
    .get();
  return snap.docs.map((d) => d.id);
}

// ─── 1. onUserRoleChanged ─────────────────────────────────────────────────────
// Triggered when a user document changes. If role changes to destination_admin,
// create a notification and log the activity.

export const onUserRoleChanged = onDocumentUpdated(
  "users/{uid}",
  async (event) => {
    const before = event.data?.before.data() as UserDoc | undefined;
    const after = event.data?.after.data() as UserDoc | undefined;

    if (!before || !after) return;

    const roleBefore = before.role;
    const roleAfter = after.role;

    // Only act when role changes to destination_admin
    if (roleBefore === roleAfter || roleAfter !== "destination_admin") return;

    const uid = event.params.uid;
    const tripIds: string[] = after.tripIds ?? [];
    const tripId = tripIds[0] ?? "system";

    try {
      await createNotification({
        userId: uid,
        tripId,
        type: "general",
        title: "Your role has been updated",
        message:
          "You have been assigned the role of Destination Admin. " +
          "You can now manage assigned destinations for the trip.",
        link: "/itinerary-builder",
      });

      await createActivityLog({
        tripId,
        action: "admin_role_changed",
        performedBy: "system",
        performedByName: "System",
        targetType: "user",
        targetId: uid,
        details: `Role changed from ${roleBefore} to ${roleAfter}`,
      });
    } catch (err) {
      console.error("[onUserRoleChanged] Error:", err);
    }
  }
);

// ─── 2. onAssignmentStatusChanged ────────────────────────────────────────────
// Triggers on assignment document updates. Fires notifications based on the
// new status value.

export const onAssignmentStatusChanged = onDocumentUpdated(
  "assignments/{assignmentId}",
  async (event) => {
    const before = event.data?.before.data() as AssignmentDoc | undefined;
    const after = event.data?.after.data() as AssignmentDoc | undefined;

    if (!before || !after) return;

    const statusBefore = before.status;
    const statusAfter = after.status;

    if (statusBefore === statusAfter) return;

    const assignmentId = event.params.assignmentId;
    const { tripId, assignedAdminId, title } = after;

    try {
      if (statusAfter === "submitted") {
        // Notify all master_admins
        const masterAdminIds = await getMasterAdminIds();
        await Promise.all(
          masterAdminIds.map((adminId) =>
            createNotification({
              userId: adminId,
              tripId,
              type: "itinerary_submitted",
              title: "Itinerary submitted for review",
              message: `Assignment "${title}" has been submitted and is awaiting your review.`,
              link: `/approval-center`,
            })
          )
        );
      } else if (statusAfter === "approved") {
        // Notify the assigned admin
        await createNotification({
          userId: assignedAdminId,
          tripId,
          type: "itinerary_approved",
          title: "Your itinerary has been approved! 🎉",
          message: `Assignment "${title}" has been approved by the master admin.`,
          link: `/itinerary-builder/${after.destinationId}`,
        });
      } else if (statusAfter === "changes_requested") {
        // Notify the assigned admin with the review comment
        const comment = after.reviewComment ?? "Please review the feedback.";
        await createNotification({
          userId: assignedAdminId,
          tripId,
          type: "changes_requested",
          title: "Changes requested on your itinerary",
          message: `Assignment "${title}" needs revisions. Feedback: "${comment}"`,
          link: `/itinerary-builder/${after.destinationId}`,
        });
      }

      // Log activity
      await createActivityLog({
        tripId,
        action:
          statusAfter === "submitted"
            ? "assignment_submitted"
            : statusAfter === "approved"
              ? "assignment_approved"
              : statusAfter === "changes_requested"
                ? "assignment_rejected"
                : "trip_updated",
        performedBy: "system",
        performedByName: "System",
        targetType: "assignment",
        targetId: assignmentId,
        details: `Status changed from ${statusBefore} to ${statusAfter}`,
      });
    } catch (err) {
      console.error("[onAssignmentStatusChanged] Error:", err);
    }
  }
);

// ─── 3. sendDeadlineReminders ─────────────────────────────────────────────────
// Runs every day at 8:00 AM IST (02:30 UTC). Queries assignments whose deadline
// is within the next 2 days and status is not approved or published.

export const sendDeadlineReminders = onSchedule(
  {
    schedule: "30 2 * * *", // 08:00 IST = 02:30 UTC
    timeZone: "Asia/Kolkata",
  },
  async () => {
    const now = Timestamp.now();
    const twoDaysFromNow = Timestamp.fromMillis(
      now.toMillis() + 2 * 24 * 60 * 60 * 1000
    );

    try {
      const snap = await db
        .collection("assignments")
        .where("deadline", "<=", twoDaysFromNow)
        .where("deadline", ">=", now)
        .get();

      const excludedStatuses = ["approved", "published"];
      const masterAdminIds = await getMasterAdminIds();

      const tasks: Promise<void>[] = [];

      for (const doc of snap.docs) {
        const assignment = doc.data() as AssignmentDoc;

        if (excludedStatuses.includes(assignment.status)) continue;

        const deadlineDate = assignment.deadline?.toDate();
        const deadlineStr = deadlineDate
          ? deadlineDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "upcoming";

        // Notify the assigned destination admin
        tasks.push(
          createNotification({
            userId: assignment.assignedAdminId,
            tripId: assignment.tripId,
            type: "deadline_approaching",
            title: "⏰ Assignment deadline approaching",
            message: `Your assignment "${assignment.title}" is due on ${deadlineStr}. Please ensure it is submitted on time.`,
            link: `/itinerary-builder/${assignment.destinationId}`,
          })
        );

        // Notify master admins
        for (const adminId of masterAdminIds) {
          tasks.push(
            createNotification({
              userId: adminId,
              tripId: assignment.tripId,
              type: "deadline_approaching",
              title: "Deadline reminder: Assignment due soon",
              message: `Assignment "${assignment.title}" (status: ${assignment.status}) is due on ${deadlineStr}.`,
              link: `/assignments`,
            })
          );
        }
      }

      await Promise.all(tasks);
      console.log(
        `[sendDeadlineReminders] Processed ${snap.docs.length} assignments.`
      );
    } catch (err) {
      console.error("[sendDeadlineReminders] Error:", err);
    }
  }
);

// ─── 4. onItineraryPublished ──────────────────────────────────────────────────
// Triggered when an assignment status changes to "published".
// Updates related itinerary days, creates an announcement, and notifies all
// trip members.

export const onItineraryPublished = onDocumentUpdated(
  "assignments/{assignmentId}",
  async (event) => {
    const before = event.data?.before.data() as AssignmentDoc | undefined;
    const after = event.data?.after.data() as AssignmentDoc | undefined;

    if (!before || !after) return;

    // Only act on transition → published
    if (before.status === after.status || after.status !== "published") return;

    const { tripId, destinationId } = after;
    const assignmentId = event.params.assignmentId;

    try {
      // 1. Fetch destination name
      const destSnap = await db.collection("destinations").doc(destinationId).get();
      const destName: string = destSnap.exists
        ? (destSnap.data()?.name ?? "Destination")
        : "Destination";

      // 2. Update all itinerary days for this destination → status: published
      const daysSnap = await db
        .collection("itineraryDays")
        .where("tripId", "==", tripId)
        .where("destinationId", "==", destinationId)
        .get();

      const dayUpdates = daysSnap.docs.map((dayDoc) =>
        dayDoc.ref.update({ status: "published", updatedAt: Timestamp.now() })
      );
      await Promise.all(dayUpdates);

      // 3. Create announcement
      await db.collection("announcements").add({
        tripId,
        title: `${destName} itinerary is now live! 🗺️`,
        body: `The complete itinerary for ${destName} has been reviewed, approved, and published. Check it out in the trip planner!`,
        isImportant: true,
        authorId: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 4. Notify all trip members
      const tripSnap = await db.collection("trips").doc(tripId).get();
      const memberSnap = await db
        .collection("users")
        .where("tripIds", "array-contains", tripId)
        .get();

      const notifyTasks = memberSnap.docs.map((memberDoc) =>
        createNotification({
          userId: memberDoc.id,
          tripId,
          type: "trip_published",
          title: `${destName} itinerary is live!`,
          message: `The itinerary for ${destName} has been published. View the full day-by-day plan now.`,
          link: `/itinerary`,
        })
      );
      await Promise.all(notifyTasks);

      // 5. Activity log
      await createActivityLog({
        tripId,
        action: "trip_published",
        performedBy: "system",
        performedByName: "System",
        targetType: "assignment",
        targetId: assignmentId,
        details: `Itinerary for ${destName} published. ${daysSnap.docs.length} day(s) updated.`,
      });

      console.log(
        `[onItineraryPublished] ${destName} published — ${daysSnap.docs.length} days updated, ${memberSnap.docs.length} members notified.`
      );
    } catch (err) {
      console.error("[onItineraryPublished] Error:", err);
    }
  }
);

// ─── 5. createAdminUser (HTTPS Callable) ─────────────────────────────────────
// Secured: only callable by authenticated master_admin users.
// Creates a Firebase Auth user, writes to Firestore, and sends an invite email.

interface CreateAdminUserData {
  email: string;
  displayName: string;
  role: "master_admin" | "destination_admin" | "viewer";
  assignedDestinationIds: string[];
  tripIds?: string[];
}

export const createAdminUser = onCall<CreateAdminUserData>(
  { enforceAppCheck: false },
  async (request) => {
    // 1. Verify caller is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to perform this action."
      );
    }

    // 2. Verify caller is a master_admin in Firestore
    const callerDoc = await db
      .collection("users")
      .doc(request.auth.uid)
      .get();

    if (!callerDoc.exists || callerDoc.data()?.role !== "master_admin") {
      throw new HttpsError(
        "permission-denied",
        "Only master admins can create admin users."
      );
    }

    const { email, displayName, role, assignedDestinationIds, tripIds } =
      request.data;

    // 3. Validate input
    if (!email || !displayName || !role) {
      throw new HttpsError(
        "invalid-argument",
        "email, displayName, and role are required."
      );
    }

    const allowedRoles = ["master_admin", "destination_admin", "viewer"];
    if (!allowedRoles.includes(role)) {
      throw new HttpsError("invalid-argument", "Invalid role specified.");
    }

    try {
      // 4. Create Firebase Auth user (no password — invite flow)
      const userRecord = await auth.createUser({
        email,
        displayName,
        emailVerified: false,
      });

      const now = Timestamp.now();

      // 5. Write Firestore user document
      const newUser: Omit<UserDoc, "uid"> = {
        displayName,
        email,
        role,
        assignedDestinationIds: assignedDestinationIds ?? [],
        tripIds: tripIds ?? [],
        status: "invited",
        createdAt: now,
        updatedAt: now,
      };

      await db.collection("users").doc(userRecord.uid).set(newUser);

      // 6. Send Firebase password reset / invite email
      const inviteLink = await auth.generatePasswordResetLink(email, {
        url: `${process.env.FRONTEND_URL ?? "https://royal-routes.web.app"}/login`,
      });

      console.log(
        `[createAdminUser] Invite link for ${email}: ${inviteLink}`
      );
      // In production, send this via SendGrid / Firebase Extensions / etc.
      // For now it is returned so the caller can relay it if needed.

      // 7. Activity log
      const callerData = callerDoc.data() as UserDoc;
      await createActivityLog({
        tripId: tripIds?.[0] ?? "system",
        action: "admin_invited",
        performedBy: request.auth.uid,
        performedByName: callerData.displayName,
        targetType: "user",
        targetId: userRecord.uid,
        details: `Invited ${displayName} (${email}) as ${role}`,
      });

      return {
        success: true,
        uid: userRecord.uid,
        inviteLink,
        message: `User ${displayName} created successfully with role ${role}.`,
      };
    } catch (err: unknown) {
      console.error("[createAdminUser] Error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "auth/email-already-exists"
      ) {
        throw new HttpsError(
          "already-exists",
          "A user with this email address already exists."
        );
      }

      throw new HttpsError(
        "internal",
        "Failed to create user. Please try again."
      );
    }
  }
);
