"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

const signUpSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type SignUpForm = z.infer<typeof signUpSchema>;

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type ResetForm = z.infer<typeof resetSchema>;

function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email. Try clicking 'Create Account' above.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. If you don't have an account, click 'Create Account' or use the 1-Click Demo buttons below.",
    "auth/email-already-in-use": "An account already exists with this email. Please sign in instead.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return messages[code] ?? "Authentication error. If you are testing, use the 1-Click Demo Access buttons below.";
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, resetPassword, appUser, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const {
    register: registerLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerSignUp,
    handleSubmit: handleSignUp,
    formState: { errors: signUpErrors, isSubmitting: signUpSubmitting },
  } = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  const {
    register: registerReset,
    handleSubmit: handleReset,
    formState: { errors: resetErrors, isSubmitting: resetSubmitting },
    reset: clearResetForm,
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  // Redirect after sign-in based on role
  if (appUser || user) {
    const role = appUser?.role ?? (user?.email?.toLowerCase().includes("admin") ? "master_admin" : "viewer");
    if (role === "master_admin" || role === "destination_admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/dashboard");
    }
    return null;
  }

  const onLogin = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password);
      toast.success("Welcome back to Royal Routes!");
      const isAdmin = data.email.toLowerCase().includes("admin");
      router.replace(isAdmin ? "/admin/dashboard" : "/dashboard");
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  const onSignUp = async (data: SignUpForm) => {
    try {
      await signUp(data.email, data.password, data.displayName);
      toast.success("Account created successfully!");
      const isAdmin = data.email.toLowerCase().includes("admin");
      router.replace(isAdmin ? "/admin/dashboard" : "/dashboard");
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  const handleDemoSignIn = async (role: "admin" | "member") => {
    setDemoLoading(role);
    const email = role === "admin" ? "admin@royalroutes.com" : "member@royalroutes.com";
    const password = role === "admin" ? "admin123456" : "member123456";
    const name = role === "admin" ? "Master Admin" : "Trip Member";

    try {
      // Try to sign in first
      try {
        await signIn(email, password);
      } catch (signInErr) {
        // If not found, create the demo account automatically
        const code = signInErr instanceof FirebaseError ? signInErr.code : "";
        if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
          await signUp(email, password, name);
        } else {
          throw signInErr;
        }
      }
      toast.success(`Signed in as ${name}!`);
      router.replace(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      console.error("Demo login error:", err);
      toast.error("Could not sign in with demo credentials. Please create an account using the form.");
    } finally {
      setDemoLoading(null);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      router.replace("/dashboard");
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      toast.error(getFirebaseErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const onPasswordReset = async (data: ResetForm) => {
    try {
      await resetPassword(data.email);
      toast.success("Password reset email sent! Check your inbox.");
      clearResetForm();
      setIsResetting(false);
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center p-4 selection:bg-[#007d8a] selection:text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md my-8">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-[#007d8a] text-sm mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Royal Routes Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#007d8a] rounded-2xl mb-3 shadow-md text-white">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {isResetting
                ? "Reset Password"
                : tab === "signin"
                ? "Welcome Back"
                : "Create an Account"}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {isResetting
                ? "Enter your email to receive a password reset link."
                : tab === "signin"
                ? "Sign in to manage or explore the Winter 2026-27 journey."
                : "Join as a group member to access itineraries & bookings."}
            </p>
          </div>

          {/* Tab Switcher (Sign In vs Create Account) */}
          {!isResetting && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 text-xs font-bold text-gray-600">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  tab === "signin"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  tab === "signup"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "hover:text-gray-900"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {isResetting ? (
            /* ── Password Reset Form ── */
            <form onSubmit={handleReset(onPasswordReset)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerReset("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007d8a] transition-all bg-white"
                  />
                </div>
                {resetErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{resetErrors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full py-2.5 px-4 bg-[#007d8a] hover:bg-[#006670] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-md"
              >
                {resetSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => setIsResetting(false)}
                className="w-full text-xs text-gray-500 hover:text-gray-800 transition-colors pt-2"
              >
                Back to Sign In
              </button>
            </form>
          ) : tab === "signin" ? (
            /* ── Sign In Form ── */
            <form onSubmit={handleLogin(onLogin)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerLogin("email")}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007d8a] transition-all bg-white"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-xs text-[#007d8a] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerLogin("password")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007d8a] transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-2.5 px-4 bg-[#007d8a] hover:bg-[#006670] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md text-sm"
              >
                {loginSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          ) : (
            /* ── Sign Up Form ── */
            <form onSubmit={handleSignUp(onSignUp)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerSignUp("displayName")}
                    type="text"
                    placeholder="Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007d8a] transition-all bg-white"
                  />
                </div>
                {signUpErrors.displayName && (
                  <p className="text-red-500 text-xs mt-1">{signUpErrors.displayName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerSignUp("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007d8a] transition-all bg-white"
                  />
                </div>
                {signUpErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{signUpErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password (6+ characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...registerSignUp("password")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007d8a] transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{signUpErrors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={signUpSubmitting}
                className="w-full py-2.5 px-4 bg-[#007d8a] hover:bg-[#006670] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md text-sm"
              >
                {signUpSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
              or 1-click access
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 1-Click Demo Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={Boolean(demoLoading)}
              onClick={() => handleDemoSignIn("admin")}
              className="w-full py-2.5 px-4 bg-teal-50 border border-teal-200 text-[#007d8a] hover:bg-teal-100 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              {demoLoading === "admin" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#007d8a]" />
              )}
              <span>1-Click Sign In as Master Admin (admin@royalroutes.com)</span>
            </button>

            <button
              type="button"
              disabled={Boolean(demoLoading)}
              onClick={() => handleDemoSignIn("member")}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              {demoLoading === "member" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
              <span>1-Click Sign In as Trip Member (member@royalroutes.com)</span>
            </button>
          </div>

          {/* Google Sign In */}
          <div className="pt-3">
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2.5 text-xs"
            >
              {googleLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>
        </div>

        {/* Member hint */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Exploring as a viewer?{" "}
          <Link href="/itinerary" className="text-[#007d8a] font-bold hover:underline">
            View the Master Itinerary directly →
          </Link>
        </p>
      </div>
    </div>
  );
}
