"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { CourseProgress } from "@/components/CourseProgress";

// Define types that match our Supabase database schema
interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  price?: number;
  is_published?: boolean;
  instructor_id?: string;
  category_id?: string;
  profiles?: Instructor;
  categories?: Category;
}

interface CourseCardProps {
  course: Course;
  progress?: number;
  href: string;
  showStatus?: boolean;
}

export function CourseCard({ course, progress, href, showStatus }: CourseCardProps) {
  const instructorName = course.profiles 
    ? `${course.profiles.first_name} ${course.profiles.last_name}`.trim()
    : "Unknown Instructor";

  return (
    <Link
      href={href}
      prefetch={false}
      className="group hover:no-underline flex"
    >
      <div className="bg-card rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:translate-y-[-4px] border border-border flex flex-col flex-1">
        <div className="relative h-52 w-full overflow-hidden">
        // Update image rendering to use getImageUrl instead of urlFor:
{course.image ? (
  <Image
    src={getImageUrl(course.image_url || "")}
    alt={course.title || "Course Image"}
    fill
    className="object-cover transition-transform duration-300 group-hover:scale-110"
  />
) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <Loader size="lg" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="text-sm font-medium px-3 py-1 bg-black/50 text-white rounded-full backdrop-blur-sm">
              {course.categories?.name || "Uncategorized"}
            </span>
            {typeof course.price === "number" && (
              <span className="text-white font-bold px-3 py-1 bg-black/50 dark:bg-white/20 rounded-full backdrop-blur-sm">
                {course.price === 0
                  ? "Free"
                  : `$${course.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`}
              </span>
            )}
            
            {showStatus && (
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                course.is_published 
                  ? 'bg-green-500/70 text-white' 
                  : 'bg-amber-500/70 text-white'
              }`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            )}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
            {course.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>
          <div className="space-y-4 mt-auto">
            {course.profiles && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {course.profiles.avatar_url ? (
                    <div className="relative h-8 w-8 mr-2">
                      <Image
                        src={course.profiles.avatar_url}
                        alt={instructorName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 mr-2 rounded-full bg-muted flex items-center justify-center">
                      <Loader size="sm" />
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    by {instructorName}
                  </span>
                </div>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            {typeof progress === "number" && (
              <CourseProgress
                progress={progress}
                variant="default"
                size="sm"
                label="Course Progress"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}