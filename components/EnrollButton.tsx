"use client";

import { createStripeCheckout } from "@/actions/createStripeCheckout";
import { useAuth } from "@/components/providers/auth-provider";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AuthModal } from "./auth/AuthModal";

function EnrollButton({
  courseId,
  isEnrolled,
}: {
  courseId: string;
  isEnrolled: boolean;
}) {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEnroll = async (courseId: string) => {
    startTransition(async () => {
      try {
        const userId = user?.id;
        if (!userId) return;

        const { url } = await createStripeCheckout(courseId, userId);
        if (url) {
          router.push(url);
        }
      } catch (error) {
        console.error("Error in handleEnroll:", error);
        throw new Error("Failed to create checkout session");
      }
    });
  };

  // Show loading state while checking user is loading
  if (isUserLoading || isPending) {
    return (
      <div className="w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show enrolled state with link to course
  if (isEnrolled) {
    return (
      <Link
        prefetch={false}
        href={`/dashboard/courses/${courseId}`}
        className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
      >
        <span>Access Course</span>
        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  // Show enroll button only when we're sure user is not enrolled
  // If not logged in, show auth modal
  if (!user?.id) {
    return (
      <AuthModal
        defaultTab="sign-in"
        trigger={
          <button className="w-full rounded-lg px-6 py-3 font-medium bg-white text-black hover:bg-gray-100 transition-all duration-300 h-12">
            Sign in to Enroll
          </button>
        }
      />
    );
  }

  return (
    <button
      className="w-full rounded-lg px-6 py-3 font-medium bg-white text-black hover:scale-105 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 h-12"
      onClick={() => handleEnroll(courseId)}
    >
      Enroll Now
    </button>
  );
}

export default EnrollButton;