import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function GET() {
  const results: Record<string, { ok: boolean; error?: string; detail?: string }> = {};

  // Test 1: Environment variables
  results.env = {
    ok: !!(process.env.MONGODB_URI && process.env.SMTP_EMAIL && process.env.SMTP_PASS),
    detail: {
      MONGODB_URI: process.env.MONGODB_URI ? "set (starts with " + process.env.MONGODB_URI.slice(0, 20) + "...)" : "MISSING",
      SMTP_EMAIL: process.env.SMTP_EMAIL || "MISSING",
      SMTP_PASS: process.env.SMTP_PASS ? "set (length " + process.env.SMTP_PASS.length + ")" : "MISSING",
    } as unknown as string,
  };

  // Test 2: MongoDB connection
  try {
    await connectDB();
    results.mongodb = { ok: true };
  } catch (e: unknown) {
    const err = e as Error;
    results.mongodb = {
      ok: false,
      error: err.message,
      detail: err.message.includes("IP") || err.message.includes("whitelist")
        ? "Add 0.0.0.0/0 to MongoDB Atlas IP Access List (Network Access)"
        : "Check MONGODB_URI in Vercel env vars",
    };
  }

  // Test 3: SMTP connection
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    results.smtp = { ok: true };
  } catch (e: unknown) {
    const err = e as Error;
    results.smtp = {
      ok: false,
      error: err.message,
      detail: "Check SMTP_EMAIL and SMTP_PASS in Vercel env vars",
    };
  }

  const allOk = Object.values(results).every((r) => r.ok);

  return NextResponse.json({ allOk, results }, { status: allOk ? 200 : 500 });
}
