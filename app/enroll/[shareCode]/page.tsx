// app/enroll/[shareCode]/page.tsx
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import { CourseDetails } from "@/components/CourseDetails";
import EnrollButton from "@/components/EnrollButton";

interface EnrollPageProps {
  params: {
    shareCode: string;
  };
}

export default async function EnrollPage({ params }: EnrollPageProps) {
  const { shareCode } = params;
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Get course data from share code
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      price,
      image_url,
      instructor_id,
      profiles:instructor_id (
        first_name,
        last_name,
        avatar_url,
        bio
      ),
      categories:category_id (
        name
      )
    `)
    .eq('share_code', shareCode)
    .single();
  
  if (error || !course) {
    return notFound();
  }
  
  // Check if student is already enrolled
  let isEnrolled = false;
  if (userId) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', userId)
      .eq('course_id', course.id)
      .maybeSingle();
    
    isEnrolled = !!enrollment;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        {course.image_url && (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-black/60" />
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                  {course.categories?.name || "Uncategorized"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                {course.description}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:min-w-[300px]">
              <div className="text-3xl font-bold text-white mb-4">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>
              <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <CourseDetails course={course} />
    </div>
  );
}