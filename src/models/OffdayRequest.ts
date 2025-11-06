import { Schema, model, models, Types } from "mongoose";

export type RequestStatus = "pending" | "in_progress" | "accepted" | "rejected";

export interface OffdayRequestDocument {
  _id: string;
  teacherId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: number;
  description: string;
  status: RequestStatus;
  rejectionMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OffdayRequestSchema = new Schema<OffdayRequestDocument>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "in_progress", "accepted", "rejected"], default: "pending", index: true },
    rejectionMessage: { type: String },
  },
  { timestamps: true }
);

export const OffdayRequestModel =
  models.OffdayRequest || model<OffdayRequestDocument>("OffdayRequest", OffdayRequestSchema);


