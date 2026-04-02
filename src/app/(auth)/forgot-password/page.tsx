"use client";

import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate: sendRecovery, isPending, isSuccess } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      sendRecovery(email);
    }
  };

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
            <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {isSuccess
                ? "Check your email for the reset link"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Recovery email sent!</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and spam folder.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-11 mt-4"
                onClick={() => {
                  setEmail("");
                  window.location.reload();
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="pt-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
