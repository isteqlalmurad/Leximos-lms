import { createClient } from "@/lib/supabase-server";

export async function getUserById(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error getting user:", error);
    return { data: null, error };
  }
  
  return { data, error: null };
}

export async function createUserIfNotExists({
  clerkId,
  email,
  firstName,
  lastName,
  imageUrl,
}: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}) {
  const supabase = createClient();
  
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clerkId)
    .single();
  
  if (existingUser) {
    return existingUser;
  }
  
  // Create new user
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: clerkId,
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      avatar_url: imageUrl || '',
      user_role: 'student'
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating user:", error);
    return null;
  }
  
  return data;
}