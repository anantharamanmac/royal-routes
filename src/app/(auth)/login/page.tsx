"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type ResetForm = z.infer<typeof resetSchema>;

function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return messages[code] ?? "An error occurred. Please try again.";
}

export default function LoginPage() {
  const { signIn, signInWithGoogle, resetPassword, appUser } = useAuth();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerReset,
    handleSubmit: handleReset,
    formState: { errors: resetErrors, isSubmitting: resetSubmitting },
    reset: clearResetForm,
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password);
      // redirect happens via AuthContext refresh + role check
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      toast.error(getFirebaseErrorMessage(code));
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      toast.error(getFirebaseErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Redirect after sign-in based on role
  if (appUser) {
    if (appUser.role === "master_admin" || appUser.role === "destination_admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/dashboard");
    }
    return null;
  }

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
    <div className="min-h-screen bg-ivory-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-royal-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold-100/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Royal Routes
        </Link>

        {/* Card */}
        <div className="card-premium p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-royal-gradient rounded-2xl mb-4 shadow-premium">
              <span className="text-2xl">🏛️</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-royal-950">
              {isResetting ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {isResetting
                ? "Enter your email to receive reset instructions."
                : "Sign in to your Royal Routes account."}
            </p>
          </div>

          {isResetting ? (
            /* ── Password Reset Form ── */
            <form onSubmit={handleReset(onPasswordReset)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    {...registerReset("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-ivory-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                {resetErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{resetErrors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full py-2.5 px-4 bg-royal-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => setIsResetting(false)}
                className="w-full text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            /* ── Login Form ── */
            <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-ivory-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-xs text-royal-600 hover:text-royal-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-4 pr-10 py-2.5 border border-ivory-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-royal-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-premium"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-ivory-200" />
                <span className="text-stone-400 text-xs">or continue with</span>
                <div className="flex-1 h-px bg-ivory-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 bg-white border border-ivory-300 text-stone-700 font-medium rounded-xl hover:bg-ivory-50 transition-colors flex items-center justify-center gap-2.5 text-sm"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </form>
          )}
        </div>

        {/* Member hint */}
        <p className="text-center text-stone-400 text-xs mt-6">
          Trip member?{" "}
          <Link href="/dashboard" className="text-royal-600 hover:text-royal-800">
            View the itinerary →
          </Link>
        </p>
      </div>
    </div>
  );
}

