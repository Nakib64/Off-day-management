import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth";
import { MongoClient } from "mongodb";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
});

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "";
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ email: session.user.email as string });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || "",
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateProfileSchema.parse(body);

  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const usersCollection = db.collection("users");

  const update: any = {};
  if (parsed.name) update.name = parsed.name;
  if (parsed.department !== undefined) update.department = parsed.department;

  await usersCollection.updateOne(
    { email: session.user.email as string },
    { $set: update }
  );

  const updated = await usersCollection.findOne({ email: session.user.email as string });
  return NextResponse.json({
    name: updated?.name,
    email: updated?.email,
    role: updated?.role,
    department: updated?.department || "",
  });
}

