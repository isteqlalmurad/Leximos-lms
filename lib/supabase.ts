import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gghrclajligrayfcxfja.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaHJjbGFqbGlncmF5ZmN4ZmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTM4MTIsImV4cCI6MjA2MDEyOTgxMn0.HrzlXkwAa_hjBPsXp7fOJfrMIKFZNoWEuww2mpHj0B4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for auth
// Helper functions for auth
export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    console.log("Signing up user:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    
    // If signup successful, immediately create a profile
    if (data?.user && !error) {
      try {
        const profileData = {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          user_role: 'student',
        };
        
        await supabase.from('profiles').upsert(profileData);
      } catch (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error in signup:", error);
    return { data: null, error: { message: "Failed to sign up" } };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log("Supabase signIn called with:", { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log("Supabase signIn response:", { data, error });
    
    return { data, error };
  } catch (error) {
    console.error("Error in signIn function:", error);
    return { data: null, error: { message: "Failed to sign in" } };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current session:", session);
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Video upload function
export const uploadVideo = async (file: File, filePath: string) => {
  const { data, error } = await supabase.storage
    .from('course-videos')
    .upload(filePath, file);
  
  return { data, error };
};

// Get video URL
export const getVideoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('course-videos')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};