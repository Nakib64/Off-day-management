import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth";
import { MongoClient, ObjectId } from "mongodb";

const DirectorSchema = z.object({
  action: z.enum(["forward", "reject"]),
  message: z.string().optional(),
});

const ChairmanSchema = z.object({
  action: z.enum(["accept", "reject"]),
  message: z.string().optional(),
});

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "";
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  const { id } = await params;

  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const collection = db.collection("offdayRequests");
  const _id = new ObjectId(id);

  const doc = await collection.findOne({ _id });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role === "director") {
    const { action, message } = DirectorSchema.parse(await _request.json());
    if (doc.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }
    const update =
      action === "forward"
        ? { $set: { status: "in_progress" }, $unset: { rejectionMessage: "" as any } }
        : { $set: { status: "rejected", rejectionMessage: message || "" } };
    await collection.updateOne({ _id }, update);
    const updated = await collection.findOne({ _id });
    return NextResponse.json(updated);
  }

  if (role === "chairman") {
    const { action, message } = ChairmanSchema.parse(await _request.json());
    if (doc.status !== "in_progress" && action === "accept") {
      return NextResponse.json({ error: "Not ready for acceptance" }, { status: 400 });
    }
    const update =
      action === "accept"
        ? { $set: { status: "accepted" }, $unset: { rejectionMessage: "" as any } }
        : { $set: { status: "rejected", rejectionMessage: message || "" } };
    await collection.updateOne({ _id }, update);
    const updated = await collection.findOne({ _id });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}


