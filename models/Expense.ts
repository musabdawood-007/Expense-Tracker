import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  userId: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
