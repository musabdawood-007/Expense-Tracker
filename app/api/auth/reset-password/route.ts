import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const record = await OTP.findOne({ email, code, used: false });
    if (!record) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    if (new Date() > record.expiresAt) {
      await OTP.deleteMany({ email });
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    record.used = true;
    await record.save();

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
