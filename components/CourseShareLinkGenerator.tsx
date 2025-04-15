// components/CourseShareLinkGenerator.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, Copy, Link } from "lucide-react";

interface CourseShareLinkGeneratorProps {
  courseId: string;
  courseSlug: string;
}

export function CourseShareLinkGenerator({ 
  courseId,
  courseSlug 
}: CourseShareLinkGeneratorProps) {
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    try {
      setIsLoading(true);
      
      // First, check if a share code already exists
      const { data: existingShare } = await supabase
        .from('courses')
        .select('share_code')
        .eq('id', courseId)
        .single();
        
      if (existingShare?.share_code) {
        setShareCode(existingShare.share_code);
        return;
      }
      
      // Generate a new share code
      const { data, error } = await supabase
        .from('courses')
        .update({ share_code: null }) // Trigger the function to generate a new code
        .eq('id', courseId)
        .select('share_code')
        .single();
      
      if (error) throw error;
      
      if (data?.share_code) {
        setShareCode(data.share_code);
      }
    } catch (error) {
      console.error("Error generating share link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareCode) return;
    
    const shareUrl = `${window.location.origin}/enroll/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (!shareCode) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-2">Share this course</h3>
        <p className="text-muted-foreground mb-4">
          Generate a unique link to share this course with students
        </p>
        <Button 
          onClick={generateShareLink} 
          disabled={isLoading}
          className="w-full"
        >
          <Link className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Generate share link"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium mb-2">Share this course</h3>
      <p className="text-muted-foreground mb-4">
        Share this link with students to enroll in your course:
      </p>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 p-2 bg-muted rounded-md text-sm overflow-hidden text-ellipsis">
          {`${window.location.origin}/enroll/${shareCode}`}
        </div>
        <Button 
          size="icon" 
          variant="outline"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Anyone with this link can view the course details and enroll
      </p>
    </div>
  );
}