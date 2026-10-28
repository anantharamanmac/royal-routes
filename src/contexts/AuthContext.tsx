"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { AppUser, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  appUser: AppUser | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = useCallback(async (firebaseUser: User) => {
    const isAdmin =
      firebaseUser.email?.toLowerCase().includes("admin") ||
      firebaseUser.email === "admin@royalroutes.com";

    try {
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setAppUser(snap.data() as AppUser);
      } else {
        // Create a default user profile on first sign-in
        const newUserDoc = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? (isAdmin ? "Master Admin" : "Trip Member"),
          email: firebaseUser.email ?? "",
          photoURL: firebaseUser.photoURL ?? undefined,
          role: (isAdmin ? "master_admin" : "viewer") as UserRole,
          assignedDestinationIds: [],
          tripIds: [],
          status: "active" as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, newUserDoc);
        setAppUser({
          ...newUserDoc,
          createdAt: null as never,
          updatedAt: null as never,
        } as AppUser);
      }
    } catch (err) {
      console.warn("Could not sync Firestore user document, using local session:", err);
      // Fallback appUser so auth never gets stuck in loading state or blocks redirect
      setAppUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? (isAdmin ? "Master Admin" : "Trip Member"),
        email: firebaseUser.email ?? "",
        role: isAdmin ? "master_admin" : "viewer",
        assignedDestinationIds: [],
        tripIds: [],
        status: "active",
        createdAt: null as never,
        updatedAt: null as never,
      });
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          await fetchAppUser(firebaseUser);
        } else {
          setAppUser(null);
        }
      } catch (err) {
        console.error("Auth state transition error:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [fetchAppUser]);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      await fetchAppUser(cred.user);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (cred.user) {
      await fetchAppUser(cred.user);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await fetchAppUser(cred.user);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("SignOut error:", e);
    } finally {
      setUser(null);
      setAppUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshUser = async () => {
    if (user) await fetchAppUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        role: appUser?.role ?? null,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        logout,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
