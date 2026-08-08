import mongoose, { Schema, Document } from "mongoose";

export interface IRoomExpense {
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  splitAmounts?: Record<string, number>;
  date: string;
}

export interface IRoom extends Document {
  code: string;
  name: string;
  createdBy: string;
  userId: string;
  members: string[];
  expenses: IRoomExpense[];
  settled: boolean;
  createdAt: Date;
}

const RoomExpenseSchema = new Schema<IRoomExpense>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitAmong: { type: [String], required: true },
  splitAmounts: { type: Schema.Types.Mixed, default: undefined },
  date: { type: String, required: true },
}, { _id: false });

const RoomSchema = new Schema<IRoom>({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  userId: { type: String, required: true },
  members: { type: [String], required: true },
  expenses: { type: [RoomExpenseSchema], default: [] },
  settled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
