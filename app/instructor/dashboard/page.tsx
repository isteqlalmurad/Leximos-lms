// app/instructor/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InstructorDashboardPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  
  // Protect this page - only instructors can access
  useEffect(() => {
    if (!isLoading && (!user || (profile?.role !== 'instructor' && profile?.role !== 'admin'))) {
      router.push('/');
    }
  }, [user, profile, isLoading, router]);
  
  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <Link href="/instructor/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>
      
      <div className="text-center py-12 border rounded-lg">
        <h2 className="text-2xl font-bold mb-2">No courses yet</h2>
        <p className="text-muted-foreground mb-6">
          Start creating your first course to share your knowledge
        </p>
        <Link href="/instructor/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Course
          </Button>
        </Link>
      </div>
    </div>
  );
}