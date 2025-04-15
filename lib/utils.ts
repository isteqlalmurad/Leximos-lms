// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url: string) {
  // If it's already a full URL, return it
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  
  // If it's a Supabase storage URL, construct the full URL
  if (url && url.startsWith('course-images/')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${url}`;
  }
  
  // Fallback to placeholder image
  return '/placeholder-course.jpg';
}