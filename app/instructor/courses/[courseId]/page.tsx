// app/instructor/courses/[courseId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { CourseForm } from "@/components/instructor/CourseForm";
import { CourseShareLinkGenerator } from "@/components/CourseShareLinkGenerator";

interface CourseEditPageProps {
  params: {
    courseId: string;
  };
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  const { courseId } = params;
  const supabase = createClient();
  
  // Check authentication and authorization
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect("/auth/signin");
  }
  
  // Get course and verify ownership
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories:category_id (id, name)
    `)
    .eq('id', courseId)
    .single();
  
  if (error || !course) {
    return notFound();
  }
  
  if (course.instructor_id !== session.user.id) {
    return redirect("/instructor/dashboard");
  }
  
  // Get all categories for the select dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content - Course form */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">Edit Course</h1>
          
          <CourseForm 
            course={course} 
            categories={categories || []}
          />
        </div>
        
        {/* Sidebar - Course actions */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-medium mb-4">Course Status</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">Published</span>
              <span className={`px-2 py-1 text-xs rounded ${
                course.is_published 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {course.is_published ? 'Live' : 'Draft'}
              </span>
            </div>
            
            <CourseShareLinkGenerator
              courseId={course.id}
              courseSlug={course.slug}
            />
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-medium mb-4">Course Content</h2>
            <div className="space-y-2">
              <a 
                href={`/instructor/courses/${courseId}/modules`}
                className="block w-full p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded text-center"
              >
                Manage Modules & Lessons
              </a>
              <a 
                href={`/instructor/courses/${courseId}/pricing`}
                className="block w-full p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded text-center"
              >
                Pricing Settings
              </a>
              <a 
                href={`/instructor/courses/${courseId}/analytics`}
                className="block w-full p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded text-center"
              >
                View Analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}