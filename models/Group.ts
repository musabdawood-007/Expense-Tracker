import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  userId: string;
  name: string;
  icon: string;
  members: string[];
  balance: number;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  icon: { type: String, default: "👥" },
  members: { type: [String], default: [] },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);
