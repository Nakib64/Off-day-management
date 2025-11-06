// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/users";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["teacher", "director", "chairman"]).default("teacher"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.parse(body);

    const usersCollection = await getUsersCollection();

    // Check for existing user
    const existing = await usersCollection.findOne({ email: parsed.email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const result = await usersCollection.insertOne({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: parsed.role,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (err) {
    let message = "Registration failed";
    if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
  
}
