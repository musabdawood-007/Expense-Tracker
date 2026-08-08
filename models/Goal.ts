import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  userId: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
  deadline: string;
  createdAt: Date;
}

const GoalSchema = new Schema<IGoal>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  icon: { type: String, default: "🎯" },
  target: { type: Number, required: true },
  saved: { type: Number, default: 0 },
  deadline: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
