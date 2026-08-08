import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  userId: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  month: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
