import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ goals });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, icon, target, saved, deadline } = body;

    if (!userId || !name || !target || !deadline) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const goal = await Goal.create({ userId, name, icon, target, saved: saved || 0, deadline });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, saved, target } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update: Record<string, number> = {};
    if (saved !== undefined) update.saved = saved;
    if (target !== undefined) update.target = target;

    const goal = await Goal.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ goal });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await Goal.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
