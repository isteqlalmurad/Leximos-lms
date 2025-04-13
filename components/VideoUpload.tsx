"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadVideo, getVideoUrl } from "@/lib/supabase";
import { Loader2, Upload, Video } from "lucide-react";

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  courseId: string;
  lessonId: string;
}

export function VideoUpload({ onVideoUploaded, courseId, lessonId }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a video
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a video file");
        return;
      }
      
      // Check file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("Video size should be less than 100MB");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split(".").pop();
      const fileName = `${courseId}/${lessonId}/${timestamp}.${fileExt}`;
      
      // Simulate progress - in a production app, you'd use Supabase's upload progress if available
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Upload the file
      const { data, error } = await uploadVideo(file, fileName);
      
      clearInterval(progressInterval);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setUploadProgress(100);
      
      // Get the public URL
      const publicUrl = getVideoUrl(fileName);
      
      // Send the URL to the parent component
      onVideoUploaded(publicUrl);
      
      // Reset the state
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload video");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border border-border rounded-md space-y-4">
      <div className="flex items-center gap-2">
        <Video className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Video Upload</h3>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        
        {file ? (
          <div className="w-full space-y-2">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            
            {uploadProgress > 0 && (
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Clear
              </Button>
              
              <Button
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Video"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              MP4, WebM, or MOV (max 100MB)
            </p>
            <input
              id="videoUpload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="videoUpload">
              <Button
                variant="outline"
                className="mt-4"
                type="button"
                as="span"
              >
                Select Video
              </Button>
            </label>
          </>
        )}
      </div>
    </div>
  );
}