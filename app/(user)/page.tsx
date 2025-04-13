// import Hero from "@/components/Hero";
// import { CourseCard } from "@/components/CourseCard";
// import { getCourses } from "@/sanity/lib/courses/getCourses";

// export const dynamic = "force-static";
// export const revalidate = 3600; // revalidate at most every hour

// export default async function Home() {
//   const courses = await getCourses();

//   return (
//     <div className="min-h-screen bg-background">
//       <Hero />

//       {/* Courses Grid */}
//       <div className="container mx-auto px-4">
//         <div className="flex items-center gap-4 py-8">
//           <div className="h-px flex-1 bg-gradient-to-r from-border/0 via-border to-border/0" />
//           <span className="text-sm font-medium text-muted-foreground">
//             Featured Courses
//           </span>
//           <div className="h-px flex-1 bg-gradient-to-r from-border/0 via-border to-border/0" />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
//           {courses.map((course) => (
//             <CourseCard
//               key={course._id}
//               course={course}
//               href={`/courses/${course.slug}`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Welcome to Courselly - Test Page</h1>
        <p className="text-xl mb-8">
          This is a test page to confirm the root route is working correctly.
        </p>
        
        <div className="p-6 bg-card rounded-lg border border-border shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Navigation Test</h2>
          <p className="mb-4">Try clicking these links to test navigation:</p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="/" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Home Page (/)
            </a>
            
            <a 
              href="/my-courses" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              My Courses
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}