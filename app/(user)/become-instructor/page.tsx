// app/(user)/become-instructor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BecomeInstructorPage() {
  const { user, profile, refreshUser } = useAuth();
  const router = useRouter();
  
  const [bio, setBio] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Check for authentication on component mount
  useEffect(() => {
    if (!user && !isLoading) {
      // Redirect to home page instead of auth page
      router.push("/");
    }
  }, [user, isLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/");
      return;
    }
    
    if (!agreed) {
      setError("You must agree to the instructor terms");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // Update user profile to instructor role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_role: 'instructor',
          bio: bio || profile?.bio || '',
        })
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      // Refresh user profile data
      await refreshUser();
      
      // Redirect to instructor dashboard
      router.push('/instructor/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // If already an instructor, redirect to dashboard
  if (profile?.role === 'instructor' || profile?.role === 'admin') {
    router.push('/instructor/dashboard');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6">Become an Instructor</h1>
      <p className="text-lg mb-8">
        Share your knowledge and expertise with students around the world. Create courses, build your audience, and earn revenue from your content.
      </p>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium">
            Instructor Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[120px]"
            placeholder="Tell students about your expertise, experience, and teaching style"
          />
        </div>
        
        <div className="space-y-4 border rounded-md p-4 bg-muted/20">
          <h2 className="font-semibold">Instructor Agreement</h2>
          <p className="text-sm">
            By becoming an instructor, you agree to:
          </p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Create original content that doesn't infringe on intellectual property rights</li>
            <li>Maintain professional conduct with students</li>
            <li>Respond to student questions in a timely manner</li>
            <li>Accept our revenue sharing model (70% to instructor, 30% to platform)</li>
            <li>Comply with our content guidelines and terms of service</li>
          </ul>
          <div className="flex items-center">
            <input
              id="agreement"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mr-2"
              required
            />
            <label htmlFor="agreement" className="text-sm">
              I agree to the instructor terms and conditions
            </label>
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !agreed}
          >
            {isLoading ? "Processing..." : "Become an Instructor"}
          </Button>
        </div>
      </form>
    </div>
  );
}