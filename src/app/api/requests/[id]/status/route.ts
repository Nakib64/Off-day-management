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
  email: z.string().email(),
  start: z.string(),
  end: z.string(),
});

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function PATCH(
  request: NextRequest,
  { params }:  { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as string;
  const { id } =await params;
  console.log(id);
  const client = await connectToDatabase();
  const db =await client.db("offdayManagement");
  const collection = db.collection("offdayRequests");
  const _id = new ObjectId(id);

  const doc = await collection.findOne({ _id });
  if (!doc)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // ============================
  // DIRECTOR SECTION
  // ============================
  if (role === "director") {
    const { action, message } = DirectorSchema.parse(await request.json());

    if (doc.status !== "pending") {
      return NextResponse.json(
        { error: "Already processed" },
        { status: 400 }
      );
    }

    const update =
      action === "forward"
        ? { $set: { status: "in_progress" }, $unset: { rejectionMessage: "" } }
        : {
            $set: { status: "rejected", rejectionMessage: message || "" },
          };

    await collection.updateOne({ _id }, update);
    const updated = await collection.findOne({ _id });
    await client.close();
    return NextResponse.json(updated);
  }

  // ============================
  // CHAIRMAN SECTION
  // ============================
  if (role === "chairman") {
    const { action, message, email, start, end } = ChairmanSchema.parse(
      await request.json()
    );


    if (doc.status !== "in_progress" && action === "accept") {
      return NextResponse.json(
        { error: "Not ready for acceptance" },
        { status: 400 }
      );
    }

    const update =
      action === "accept"
        ? { $set: { status: "accepted" }, $unset: { rejectionMessage: "" } }
        : {
            $set: { status: "rejected", rejectionMessage: message || "" },
          };

    await collection.updateOne({ _id }, update);
    const updated = await collection.findOne({ _id });

    // Only add offdays if accepted
    if (action === "accept") {
      const userCollection = db.collection("users");

      await userCollection.updateOne(
        { email },
        {
          $push: {
            offdays: {
              start: new Date(start),
              end: new Date(end),
            },
          },
        } as any
      );
    }

    await client.close();
    return NextResponse.json(updated);
  }

  await client.close();
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
