import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Budget from "@/models/Budget";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ budgets });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, category, limit, month } = body;

    if (!userId || !category || !limit || !month) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const budget = await Budget.create({ userId, category, limit, spent: 0, month });
    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, limit, spent } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update: Record<string, number> = {};
    if (limit !== undefined) update.limit = limit;
    if (spent !== undefined) update.spent = spent;

    const budget = await Budget.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ budget });
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

    await Budget.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
