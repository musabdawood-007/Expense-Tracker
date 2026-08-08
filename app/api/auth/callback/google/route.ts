import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.redirect(new URL("/auth/login?error=no_code", req.url));

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${new URL(req.url).origin}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) return NextResponse.redirect(new URL("/auth/login?error=token_failed", req.url));

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) return NextResponse.redirect(new URL("/auth/login?error=no_email", req.url));

    await connectDB();

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        password: "google_oauth",
      });
    }

    const origin = new URL(req.url).origin;
    const userData = encodeURIComponent(JSON.stringify({ id: user._id.toString(), name: user.name, email: user.email }));
    return NextResponse.redirect(`${origin}/auth/callback/google?user=${userData}`);
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/login?error=server", req.url));
  }
}
