// app/auth/signin/page.tsx
"use client";

import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        
        <SignInForm />
        
        <div className="mt-4 text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}