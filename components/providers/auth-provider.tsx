// components/providers/auth-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, getCurrentUser } from "@/lib/supabase";

type UserRole = "student" | "instructor" | "admin";

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      // Get authenticated user
      const currentUser = await getCurrentUser();
      console.log("Current user from auth:", currentUser);
      
      setUser(currentUser);
      
      // If user is authenticated, get their profile
      if (currentUser) {
        try {
          // Check if this user exists in the auth.users table
          const { data: userCheck, error: userCheckError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('id', currentUser.id)
            .single();
          
          console.log("User check result:", { userCheck, userCheckError });
          
          // Handle profile separately
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          console.log("Profile query result:", { profileData, profileError });
          
          if (profileData) {
            setProfile({
              id: profileData.id,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: profileData.email || currentUser.email || '',
              avatarUrl: profileData.avatar_url,
              role: profileData.user_role as UserRole || 'student',
            });
          } else {
            // Only try to create profile if user exists in auth.users
            if (userCheck || currentUser.id) {
              // Create profile if it doesn't exist
              try {
                const newProfileData = {
                  id: currentUser.id,
                  first_name: '',
                  last_name: '',
                  email: currentUser.email,
                  user_role: 'student',
                };
                
                console.log("Attempting to create profile with data:", newProfileData);
                
                const { data, error } = await supabase
                  .from('profiles')
                  .upsert(newProfileData)
                  .select()
                  .single();
                
                console.log("Profile insert result:", { data, error });
                
                if (error) throw error;
                
                if (data) {
                  setProfile({
                    id: data.id,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    email: data.email || currentUser.email || '',
                    avatarUrl: data.avatar_url,
                    role: data.user_role as UserRole || 'student',
                  });
                }
              } catch (insertError) {
                console.error("Error creating profile:", insertError);
              }
            } else {
              console.warn("Cannot create profile: User does not exist in auth.users table");
            }
          }
        } catch (error) {
          console.error("Error processing user profile:", error);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("AuthProvider mounted - loading user data");
    refreshUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      refreshUser();
    });

    return () => {
      console.log("AuthProvider unmounting - cleaning up");
      subscription.unsubscribe();
    };
  }, []);

  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isInstructor,
      isAdmin,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}