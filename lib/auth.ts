import { isEnrolledInCourse } from "@/lib/enrollments";
import { getUserById } from "@/lib/users";
import { getCourseById } from "@/lib/courses";
import { getCurrentUser } from "./supabase";

interface AuthResult {
  isAuthorized: boolean;
  redirect?: string;
  userId?: string;
}

export async function checkCourseAccess(
  userId: string | null,
  courseId: string
): Promise<AuthResult> {
  if (!userId) {
    return {
      isAuthorized: false,
      redirect: "/",
    };
  }

  // Get user profile from Supabase
  const { data: userProfile } = await getUserById(userId);
  
  if (!userProfile) {
    return {
      isAuthorized: false,
      redirect: "/",
    };
  }

  // Check if user is enrolled in the course
  const isEnrolled = await isEnrolledInCourse(userId, courseId);
  
  // If not enrolled, redirect to course page
  if (!isEnrolled) {
    const course = await getCourseById(courseId);
    return {
      isAuthorized: false,
      redirect: `/courses/${course?.slug}`,
    };
  }

  // User is authorized to access course content
  return {
    isAuthorized: true,
    userId: userId,
  };
}

export async function getUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}