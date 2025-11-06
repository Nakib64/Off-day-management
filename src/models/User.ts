import { Schema, model, models } from "mongoose";

export type UserRole = "teacher" | "director" | "chairman";

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["teacher", "director", "chairman"], required: true },
  },
  { timestamps: true }
);

export const UserModel = models.User || model<UserDocument>("User", UserSchema);


