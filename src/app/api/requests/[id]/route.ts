import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth";
import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";

const UpdateSchema = z.object({
  subject: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().min(5).optional(),
});

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "";
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  if (role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.parse(body);

  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const collection = db.collection("offdayRequests");
  const _id = new ObjectId(id);

  // Check if request exists and belongs to the teacher
  const existing = await collection.findOne({ _id, teacherEmail: session.user.email as string });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only allow editing if status is pending
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Cannot edit request that is already processed" }, { status: 400 });
  }

  const update: any = {};
  if (parsed.subject) update.subject = parsed.subject;
  if (parsed.startDate) update.startDate = new Date(parsed.startDate);
  if (parsed.endDate) update.endDate = new Date(parsed.endDate);
  if (parsed.description) update.description = parsed.description;

  // Recalculate days if dates are updated
  if (update.startDate || update.endDate) {
    const start = update.startDate ? new Date(update.startDate) : new Date(existing.startDate);
    const end = update.endDate ? new Date(update.endDate) : new Date(existing.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }
    if (end < start) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }
    
    const msPerDay = 1000 * 60 * 60 * 24;
    update.days = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
  }

  await collection.updateOne({ _id }, { $set: update });
  const updated = await collection.findOne({ _id });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  if (role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const collection = db.collection("offdayRequests");
  const _id = new ObjectId(id);

  // Check if request exists and belongs to the teacher
  const existing = await collection.findOne({ _id, teacherEmail: session.user.email as string });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only allow deleting if status is pending
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Cannot delete request that is already processed" }, { status: 400 });
  }

  await collection.deleteOne({ _id });
  return NextResponse.json({ success: true });
}

