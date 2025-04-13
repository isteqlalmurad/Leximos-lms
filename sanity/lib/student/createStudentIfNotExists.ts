// Update sanity/lib/student/createStudentIfNotExists.ts
import { client } from "../adminClient";
import groq from "groq";

export async function createStudentIfNotExists({
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
  try {
    // First check if student exists
    const existingStudentQuery = await client.fetch(
      groq`*[_type == "student" && clerkId == $clerkId][0]`,
      { clerkId }
    );

    if (existingStudentQuery) {
      console.log("Student already exists", existingStudentQuery);
      return existingStudentQuery;
    }

    // If no student exists, create a new one
    const newStudent = await client.create({
      _type: "student",
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl,
    });

    console.log("New student created", newStudent);
    return newStudent;
  } catch (error) {
    console.error("Error in createStudentIfNotExists:", error);
    // Return a basic object to prevent UI errors
    return null;
  }
}