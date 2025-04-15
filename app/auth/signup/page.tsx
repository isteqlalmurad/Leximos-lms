// app/auth/signup/page.tsx
"use client";

import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        
        <SignUpForm />
        
        <div className="mt-4 text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}