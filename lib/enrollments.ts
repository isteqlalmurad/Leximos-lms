import { createClient } from "@/lib/supabase-server";

export async function getEnrolledCourses(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      amount,
      is_free,
      courses:course_id (
        id,
        title,
        slug,
        description,
        image_url,
        price,
        categories:category_id (id, name),
        profiles:instructor_id (id, first_name, last_name, avatar_url)
      )
    `)
    .eq('student_id', userId);
  
  if (error) {
    console.error("Error getting enrolled courses:", error);
    return [];
  }
  
  return data || [];
}

export async function isEnrolledInCourse(userId: string, courseId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  if (error) {
    console.error("Error checking enrollment:", error);
    return false;
  }
  
  return !!data;
}

export async function createEnrollment({
  studentId,
  courseId,
  paymentId,
  amount
}: {
  studentId: string;
  courseId: string;
  paymentId: string;
  amount: number;
}) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      course_id: courseId,
      payment_id: paymentId,
      amount: amount,
      is_free: amount === 0,
      enrolled_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating enrollment:", error);
    throw error;
  }
  
  return data;
}