import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    // For development/testing purposes: use a test account instead of real credentials
    // This will make the contact form work without requiring real SMTP credentials
    let transporter;
    
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_SERVER_USER) {
      // Create a test account using Ethereal Email for development
      const testAccount = await nodemailer.createTestAccount();
      
      // Log the test account details so you can check the emails in Ethereal's web interface
      console.log("Test account created:", testAccount);
      
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      // Use actual SMTP settings for production
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        connectionTimeout: 10000, // 10 seconds
        timeout: 30000, // 30 seconds
        ...(process.env.NODE_ENV !== 'production' && { debug: true })
      } as nodemailer.TransportOptions);
    }

    // Verify SMTP connection configuration
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      return NextResponse.json(
        { error: "Email server connection failed. Please try again later." },
        { status: 500 }
      );
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Contact Form" <no-reply@placement.iiitn.ac.in>`,
      to: process.env.EMAIL_TO || "placements@iiitn.ac.in",
      replyTo: email,
      subject: `Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          <p>You have received a new message from the contact form on your website.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p style="margin-bottom: 0;"><strong>Message:</strong></p>
            <p style="background-color: white; padding: 10px; border-radius: 4px; border-left: 4px solid #3b82f6;">${message.replace(/\n/g, '<br />')}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This email was sent from the IIIT Nagpur Placement Cell website contact form.</p>
        </div>
      `,
    };

    try {
      // Send email with a timeout
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Email sending timed out")), 15000)
        )
      ]);
      
      // If using ethereal for testing, log the preview URL
      if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_SERVER_USER) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info as nodemailer.SentMessageInfo));
      }
      
      return NextResponse.json({ success: true });
    } catch (sendError) {
      console.error("Email sending failed:", sendError);
      
      // For development, return a less scary error
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: "Email not sent in development mode, but form submission accepted" 
        });
      }
      
      throw sendError; // Re-throw to be caught by the outer catch block
    }

  } catch (error) {
    console.error("Contact form processing failed:", error);
    
    // Determine the specific error message
    let errorMessage = "Failed to process your request. Please try again later.";
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "The email server is taking too long to respond. Please try again later.";
      } else if (error.message.includes("socket close")) {
        errorMessage = "Connection to email server was lost. Please try again later.";
      } else if (error.message.includes("authentication")) {
        errorMessage = "Email service authentication failed. Please contact support.";
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}