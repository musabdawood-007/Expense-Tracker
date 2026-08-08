import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import OTP from "@/models/OTP";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email, used: false });

    await OTP.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EXPENSE TRACKER" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "EXPENSE TRACKER — Your verification code",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 420px; margin: 0 auto; padding: 0;">
          <div style="background: #1E1B4B; border-radius: 12px 12px 0 0; padding: 24px 32px; text-align: center;">
            <div style="display: inline-block; background: #FAF7F2; color: #1E1B4B; width: 40px; height: 40px; border-radius: 10px; line-height: 40px; font-size: 16px; font-weight: 700; font-family: serif; margin-bottom: 10px;">₨</div>
            <div style="color: #FAF7F2; font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">EXPENSE TRACKER</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #EDE7DA; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
            <h2 style="color: #1E1B4B; font-size: 20px; margin: 0 0 8px 0;">Verify your login</h2>
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px 0;">Use the code below to complete your sign in. It expires in <strong>5 minutes</strong>.</p>
            <div style="background: #FAF7F2; border: 1px solid #EDE7DA; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1E1B4B; font-family: serif;">${code}</span>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
