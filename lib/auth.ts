import { isEnrolledInCourse } from "@/sanity/lib/student/isEnrolledInCourse";
import { getStudentByClerkId } from "@/sanity/lib/student/getStudentByClerkId";
import getCourseById from "@/sanity/lib/courses/getCourseById";
import { getCurrentUser } from "./supabase";

interface AuthResult {
  isAuthorized: boolean;
  redirect?: string;
  studentId?: string;
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

  // We're still using the Sanity student functions, but passing in the Supabase userId
  const student = await getStudentByClerkId(userId);
  if (!student?.data?._id) {
    return {
      isAuthorized: false,
      redirect: "/",
    };
  }

  const isEnrolled = await isEnrolledInCourse(userId, courseId);
  const course = await getCourseById(courseId);
  if (!isEnrolled) {
    return {
      isAuthorized: false,
      redirect: `/courses/${course?.slug?.current}`,
    };
  }

  return {
    isAuthorized: true,
    studentId: student.data._id,
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