// lib/users.ts
import clientPromise from "@/lib/mongodb";

export async function getUsersCollection() {
  const client = await clientPromise;
  const db = client.db("offdayManagement"); // replace with actual DB name
  return db.collection("users");
}
