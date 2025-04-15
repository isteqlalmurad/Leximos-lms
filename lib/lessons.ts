import { createClient } from "@/lib/supabase-server";

export async function getLessonById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      slug,
      description,
      content,
      video_url,
      position,
      modules:module_id (
        id,
        title,
        courses:course_id (
          id,
          title,
          slug
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }
  
  return data;
}

export async function completeLessonById({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) {
  const supabase = createClient();
  
  // Check if already completed
  const { data: existingCompletion } = await supabase
    .from('lesson_completions')
    .select('id')
    .eq('student_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  if (existingCompletion) {
    return existingCompletion;
  }
  
  // Create completion record
  const { data, error } = await supabase
    .from('lesson_completions')
    .insert({
      student_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error completing lesson:", error);
    throw error;
  }
  
  return data;
}

export async function uncompleteLessonById({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('lesson_completions')
    .delete()
    .eq('student_id', userId)
    .eq('lesson_id', lessonId);
  
  if (error) {
    console.error("Error uncompleting lesson:", error);
    throw error;
  }
  
  return true;
}

export async function getLessonCompletionStatus(
  lessonId: string,
  userId: string
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lesson_completions')
    .select('id')
    .eq('student_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  if (error) {
    console.error("Error getting completion status:", error);
    return false;
  }
  
  return !!data;
}

export async function getCourseProgress(userId: string, courseId: string) {
  const supabase = createClient();
  
  // Get all lessons for the course
  const { data: courseLessons, error: courseLessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      modules!inner (
        id,
        course_id
      )
    `)
    .eq('modules.course_id', courseId);
  
  if (courseLessonsError) {
    console.error("Error getting course lessons:", courseLessonsError);
    return { completedLessons: [], courseProgress: 0 };
  }
  
  // Get completed lessons
  const { data: completedLessons, error: completionsError } = await supabase
    .from('lesson_completions')
    .select(`
      id,
      lesson_id,
      lessons:lesson_id (
        id,
        title,
        modules:module_id (
          id,
          title
        )
      )
    `)
    .eq('student_id', userId)
    .in('lesson_id', courseLessons.map(lesson => lesson.id));
  
  if (completionsError) {
    console.error("Error getting completed lessons:", completionsError);
    return { completedLessons: [], courseProgress: 0 };
  }
  
  // Calculate progress
  const totalLessons = courseLessons.length;
  const completedCount = completedLessons.length;
  const courseProgress = totalLessons > 0 
    ? Math.round((completedCount / totalLessons) * 100) 
    : 0;
  
  return {
    completedLessons: completedLessons || [],
    courseProgress
  };
}