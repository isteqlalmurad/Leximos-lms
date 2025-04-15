"use server";

import stripe from "@/lib/stripe";
import baseUrl from "@/lib/baseUrl";

import { getImageUrl } from "@/lib/utils";
import { getCourseById } from "@/lib/courses";
import { createUserIfNotExists } from "@/lib/users";
import { createEnrollment } from "@/lib/enrollments";
import { supabase } from "@/lib/supabase";

export async function createStripeCheckout(courseId: string, userId: string) {
  try {
    // 1. Query course details from Supabase
    const course = await getCourseById(courseId);
    
    // Get user details from Supabase
    const { data: userData, error: userError } = await supabase.auth
      .admin.getUserById(userId);
    
    if (userError || !userData.user) {
      throw new Error("User details not found");
    }
    
    const { email, user_metadata } = userData.user;
    
    if (!email) {
      throw new Error("User email not found");
    }

    if (!course) {
      throw new Error("Course not found");
    }

    // Create a user profile if it doesn't exist
    const user = await createUserIfNotExists({
      clerkId: userId, // Using Supabase user ID
      email: email || "",
      firstName: user_metadata?.firstName || email,
      lastName: user_metadata?.lastName || "",
      imageUrl: user_metadata?.avatar_url || "",
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Validate course data and prepare price for Stripe
    if (typeof course.price !== 'number') {
      throw new Error("Course price is not set");
    }
    const priceInCents = Math.round(course.price * 100);

    // if course is free, create enrollment and redirect to course page (BYPASS STRIPE CHECKOUT)
    if (priceInCents === 0) {
      await createEnrollment({
        studentId: userId,
        courseId: courseId,
        paymentId: "free",
        amount: 0,
      });

      return { url: `/courses/${course.slug}` };
    }

    const { title, description, image_url, slug } = course;

    if (!title || !description || !slug) {
      throw new Error("Course data is incomplete");
    }

    // 3. Create and configure Stripe Checkout Session with course details
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title,
              description: description,
              images: image_url ? [image_url] : [],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/courses/${slug}`,
      cancel_url: `${baseUrl}/courses/${slug}?canceled=true`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
    });

    // 4. Return checkout session URL for client redirect
    return { url: session.url };
  } catch (error) {
    console.error("Error in createStripeCheckout:", error);
    throw new Error("Failed to create checkout session");
  }
}