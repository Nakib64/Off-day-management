import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "";
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}
export async function GET(req: Request) {
  try {
    const client = await connectToDatabase();
    const db = client.db("offdayManagement"); // default DB from connection string

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const statusFilter = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!dateParam) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const date = new Date(dateParam);
    const skip = (page - 1) * limit;

    // Build search query with regex
    const searchQuery: any = {};
    if (search) {
      searchQuery["$or"] = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await db
      .collection("users")
      .find(searchQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

   
    const totalItems = await db.collection("users").countDocuments(searchQuery);

    const processed = users.map((user) => {
      const offdays = user.offdays || [];
      const isOnLeave = offdays.some((off: any) => {
        const start = new Date(off.start);
        const end = new Date(off.end);
        return date >= start && date <= end;
      });
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: isOnLeave ? "on_leave" : "available",
      };
    });

    const filtered =
      statusFilter === "all"
        ? processed
        : processed.filter((user) => user.status === statusFilter);

    return NextResponse.json({
      teachers: filtered,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error("Error in /api/users/status:", error);
    return NextResponse.json(
      { error: "Failed to fetch users status" },
      { status: 500 }
    );
  }
}
