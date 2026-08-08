import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectDB();

    // Create demo user
    const existing = await User.findOne({ email: "demo@musab.dev" });
    let userId: string;

    if (existing) {
      userId = existing._id.toString();
    } else {
      const hashed = await bcrypt.hash("123", 10);
      const user = await User.create({ name: "Ali", email: "demo@musab.dev", password: hashed });
      userId = user._id.toString();
    }

    // Clear old data
    await Expense.deleteMany({ userId });
    await Group.deleteMany({ userId });

    // Seed expenses
    const expenses = [
      { userId, title: "Salary", amount: 85000, type: "income", category: "Income", date: "2026-08-01" },
      { userId, title: "Groceries", amount: 1240, type: "expense", category: "Food", date: "2026-08-05" },
      { userId, title: "Netflix", amount: 649, type: "expense", category: "Entertainment", date: "2026-08-04" },
      { userId, title: "Fuel", amount: 2150, type: "expense", category: "Transport", date: "2026-08-03" },
      { userId, title: "Dining out", amount: 870, type: "expense", category: "Food", date: "2026-08-02" },
      { userId, title: "Mutual fund dividend", amount: 3200, type: "income", category: "Investment", date: "2026-08-02" },
      { userId, title: "Shopping", amount: 3499, type: "expense", category: "Shopping", date: "2026-08-01" },
      { userId, title: "Electricity bill", amount: 1820, type: "expense", category: "Utilities", date: "2026-08-07" },
      { userId, title: "Broadband", amount: 999, type: "expense", category: "Utilities", date: "2026-08-09" },
      { userId, title: "Spotify", amount: 119, type: "expense", category: "Entertainment", date: "2026-08-12" },
    ];
    await Expense.insertMany(expenses);

    // Seed groups
    const groups = [
      { userId, name: "Roommates", icon: "🏠", members: ["Ali", "Ahmed", "John", "Sara"], balance: 45 },
      { userId, name: "Trip to Bali", icon: "✈️", members: ["Ali", "Ahmed", "Karen"], balance: -120 },
      { userId, name: "Dinner Club", icon: "🍽️", members: ["Ali", "Lisa", "Ryan", "Paul", "Tom"], balance: 12.5 },
      { userId, name: "Office Lunch", icon: "💼", members: ["Ali", "Dave", "Chris"], balance: -28 },
    ];
    await Group.insertMany(groups);

    return NextResponse.json({ success: true, userId, expenseCount: expenses.length, groupCount: groups.length });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
