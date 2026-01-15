import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo purposes
// In production, replace with a database (Supabase, PostgreSQL, etc.)
// or an email service (Resend, SendGrid, Mailchimp, etc.)
const waitlistEmails: Set<string> = new Set();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email presence
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check for duplicate
    if (waitlistEmails.has(trimmedEmail)) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Add to waitlist
    waitlistEmails.add(trimmedEmail);

    // Log for demo purposes (in production, save to database)
    console.log(`[Waitlist] New signup: ${trimmedEmail}`);
    console.log(`[Waitlist] Total signups: ${waitlistEmails.size}`);

    // In production, you would:
    // 1. Save to database (Supabase, PostgreSQL, etc.)
    // 2. Send confirmation email (Resend, SendGrid, etc.)
    // 3. Add to email marketing list (Mailchimp, ConvertKit, etc.)

    // Example Resend integration:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Frixo <hello@frixo.dev>',
    //   to: trimmedEmail,
    //   subject: 'Welcome to the Frixo Waitlist!',
    //   html: '<p>Thanks for joining! We'll be in touch soon.</p>'
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the waitlist",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Waitlist] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Optional: Return waitlist count for admin purposes
  // In production, this should be protected with authentication
  return NextResponse.json({
    count: waitlistEmails.size,
    message: "Waitlist API is running",
  });
}
