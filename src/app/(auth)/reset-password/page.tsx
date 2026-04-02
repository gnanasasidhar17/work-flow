"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const secret = searchParams.get("secret") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const isValid = password.length >= 8 && password === confirmPassword;
  const hasMinLength = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // If no userId or secret, show error
  if (!userId || !secret) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Invalid reset link</p>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full h-11 mt-2">
            Request new reset link
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    resetPassword({ userId, secret, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>

      {/* Password requirements */}
      <div className="space-y-1.5 text-xs">
        <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-600" : "text-muted-foreground"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-600" : "bg-muted-foreground/40"}`} />
          At least 8 characters
        </div>
        <div className={`flex items-center gap-2 ${passwordsMatch ? "text-emerald-600" : "text-muted-foreground"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-emerald-600" : "bg-muted-foreground/40"}`} />
          Passwords match
        </div>
      </div>

      <Button type="submit" className="w-full h-11" disabled={isPending || !isValid}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Resetting...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Reset password
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent)/0.3),transparent_70%)]" />

      <Card className="w-full max-w-md relative z-10 shadow-lg border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto pt-2 pb-2">
            <svg id="logo-38" width="85" height="35" viewBox="0 0 78 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm mx-auto">
              <path d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z" className="ccustom" fill="#FF7A00" />
              <path d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z" className="ccompli1" fill="#FF9736" />
              <path d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z" className="ccompli2" fill="#FFBC7D" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Enter your new password below
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <Suspense fallback={<div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="pt-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
