// app/api/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import stripe from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();
    
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // app/api/enroll/route.ts (continued)
    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }
    
    // If course is free, create enrollment directly
    if (course.price === 0) {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: session.user.id,
          course_id: courseId,
          payment_id: 'free',
          amount: 0,
          is_free: true
        })
        .select()
        .single();
      
      if (enrollmentError) {
        return NextResponse.json(
          { error: "Failed to enroll in course" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        enrollment,
        redirect: `/dashboard/courses/${course.slug}`
      });
    }
    
    // For paid courses, create Stripe checkout session
    // Get user profile for customer information
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', session.user.id)
      .single();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: profile?.email || session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description,
              images: course.image_url ? [course.image_url] : [],
            },
            unit_amount: Math.round(course.price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/enroll/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/courses/${course.slug}?canceled=true`,
      metadata: {
        courseId,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      checkoutUrl: stripeSession.url
    });
    
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}