import { createClient } from "@/lib/supabase-server";

export async function getCourses() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      image_url,
      price,
      is_published,
      categories:category_id (id, name),
      profiles:instructor_id (id, first_name, last_name, avatar_url)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  
  return data || [];
}

export async function getCourseById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      image_url,
      price,
      is_published,
      categories:category_id (id, name),
      profiles:instructor_id (id, first_name, last_name, avatar_url, bio),
      modules:modules (
        id,
        title,
        position,
        description,
        lessons:lessons (
          id,
          title,
          slug,
          description,
          position,
          video_url
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching course:", error);
    return null;
  }
  
  // Sort modules and lessons by position
  if (data?.modules) {
    data.modules.sort((a, b) => a.position - b.position);
    
    data.modules.forEach(module => {
      if (module.lessons) {
        module.lessons.sort((a, b) => a.position - b.position);
      }
    });
  }
  
  return data;
}

export async function getCourseBySlug(slug: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      image_url,
      price,
      is_published,
      categories:category_id (id, name),
      profiles:instructor_id (id, first_name, last_name, avatar_url, bio),
      modules:modules (
        id,
        title,
        position,
        description,
        lessons:lessons (
          id,
          title,
          slug,
          description,
          position,
          video_url
        )
      )
    `)
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error("Error fetching course:", error);
    return null;
  }
  
  // Sort modules and lessons by position
  if (data?.modules) {
    data.modules.sort((a, b) => a.position - b.position);
    
    data.modules.forEach(module => {
      if (module.lessons) {
        module.lessons.sort((a, b) => a.position - b.position);
      }
    });
  }
  
  return data;
}

export async function searchCourses(term: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      image_url,
      price,
      is_published,
      categories:category_id (id, name),
      profiles:instructor_id (id, first_name, last_name, avatar_url)
    `)
    .eq('is_published', true)
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  
  if (error) {
    console.error("Error searching courses:", error);
    return [];
  }
  
  return data || [];
}