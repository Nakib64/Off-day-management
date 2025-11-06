import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth";
import { MongoClient } from "mongodb";

// Connection Helper
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "";
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  const url = new URL(request.url);

  // Pagination
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  // Filters
  const status = url.searchParams.get("status") || "all";
  const search = url.searchParams.get("search") || "";

  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const collection = db.collection("offdayRequests");

  // Base Query
  const query: any = {};
  if (role === "teacher") {
    query.teacherEmail = session.user.email as string;
  }

  if (status !== "all") {
    query.status = status;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { teacherName: { $regex: regex } },
      { teacherEmail: { $regex: regex } },
      { subject: { $regex: regex } },
    ];
  }

  // Fetch filtered and paginated data
  const [totalItems, items] = await Promise.all([
    collection.countDocuments(query),
    collection.aggregate([
      { $match: query },
      {
        $addFields: {
          statusPriority: { $cond: [{ $eq: ["$status", "in_progress"] }, 0, 1] }
        }
      },
      { $sort: { statusPriority: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]).toArray() ])
    

  const totalPages = Math.ceil(totalItems / limit);

  return NextResponse.json(
    {
      requests: items,
      totalPages,
      totalItems,
      currentPage: page,
    },
    { status: 200 }
  );
}


export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  if (role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Skip validation - use raw body (riskier)
  const parsed = body;

  const start = new Date(parsed.startDate);
  const end = new Date(parsed.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }
  if (end < start) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;

  const client = await connectToDatabase();
  const db = client.db("offdayManagement");
  const collection = db.collection("offdayRequests");

  const created = await collection.insertOne({
    teacherEmail: session.user?.email as string,
    subject: parsed.subject,
    startDate: start,
    endDate: end,
    days,
    description: parsed.description,
    status: "pending",
    createdAt: new Date(),
  });

  return NextResponse.json(created, { status: 200 });
}

