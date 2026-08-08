import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import Goal from "@/models/Goal";
import Group from "@/models/Group";
import Room from "@/models/Room";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { id, name } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update: Record<string, string> = {};
    if (name) update.name = name;

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email } });
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

    await User.findByIdAndDelete(id);
    await Expense.deleteMany({ userId: id });
    await Budget.deleteMany({ userId: id });
    await Goal.deleteMany({ userId: id });
    await Group.deleteMany({ userId: id });
    await Room.deleteMany({ createdBy: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
