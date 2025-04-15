// components/EnrollButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthModal } from "./auth/AuthModal";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
}

export default function EnrollButton({ courseId, isEnrolled }: EnrollButtonProps) {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnroll = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll");
      }
      
      // For free courses, redirect to course page
      if (data.redirect) {
        router.push(data.redirect);
        return;
      }
      
      // For paid courses, redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      
    } catch (err: any) {
      setError(err.message);
      console.error("Enrollment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isUserLoading || isLoading) {
    return (
      <Button disabled className="w-full h-12">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {isLoading ? "Processing..." : "Loading..."}
      </Button>
    );
  }

  // Show enrolled state
  if (isEnrolled) {
    return (
      <Link href={`/dashboard/courses/${courseId}`} className="w-full">
        <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" />
          Access Course
        </Button>
      </Link>
    );
  }

  // Show auth modal for not logged in users
  if (!user) {
    return (
      <AuthModal
        defaultTab="sign-in"
        trigger={
          <Button className="w-full h-12">
            Sign in to Enroll
          </Button>
        }
      />
    );
  }

  // Show enroll button
  return (
    <>
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      <Button 
        onClick={handleEnroll} 
        className="w-full h-12"
      >
        Enroll Now
      </Button>
    </>
  );
}