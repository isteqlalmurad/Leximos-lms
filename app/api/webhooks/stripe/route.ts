// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get the customer and course from the metadata
      const { courseId, userId } = session.metadata || {};

      if (!courseId || !userId) {
        return NextResponse.json(
          { error: "Missing metadata in Stripe session" },
          { status: 400 }
        );
      }

      // Create a Supabase admin client to bypass RLS
      const supabase = createClient();

      // Create enrollment record
      await supabase.from("enrollments").insert({
        student_id: userId,
        course_id: courseId,
        payment_id: session.id,
        amount: (session.amount_total || 0) / 100, // Convert from cents to dollars
        is_free: false,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}