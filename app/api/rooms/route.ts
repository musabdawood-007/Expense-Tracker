import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");

    if (code) {
      const room = await Room.findOne({ code });
      if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json({ room });
    }

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const userName = searchParams.get("userName");
    const query = userName
      ? { $or: [{ members: userName }, { createdBy: userName }], settled: false }
      : { members: userId, settled: false };
    const rooms = await Room.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, action, code, memberName } = body;

    if (action === "join") {
      if (!code || !memberName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      const room = await Room.findOne({ code });
      if (!room) return NextResponse.json({ error: "Invalid room code" }, { status: 404 });
      if (!room.members.includes(memberName)) {
        room.members.push(memberName);
        await room.save();
      }
      return NextResponse.json({ room });
    }

    if (!userId || !name || !memberName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    let code2 = generateCode();
    let attempts = 0;
    while (await Room.findOne({ code: code2 }) && attempts < 10) {
      code2 = generateCode();
      attempts++;
    }

    const room = await Room.create({
      code: code2,
      name,
      createdBy: memberName,
      members: [memberName],
      expenses: [],
    });
    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomId, expense, settle } = body;

    if (settle) {
      const room = await Room.findByIdAndUpdate(roomId, { settled: true }, { new: true });
      return NextResponse.json({ room });
    }

    if (!roomId || !expense) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const room = await Room.findById(roomId);
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    room.expenses.push(expense);
    await room.save();
    return NextResponse.json({ room });
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

    await Room.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
