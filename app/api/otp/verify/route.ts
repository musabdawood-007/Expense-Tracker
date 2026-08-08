import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OTP from "@/models/OTP";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ error: "Email and code required" }, { status: 400 });

    const record = await OTP.findOne({ email, code, used: false });
    if (!record) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    if (new Date() > record.expiresAt) {
      await OTP.deleteMany({ email });
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    record.used = true;
    await record.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
