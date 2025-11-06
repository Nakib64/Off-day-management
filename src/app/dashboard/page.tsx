"use client";
import { useSession } from "next-auth/react";

export default  function DashboardHome() {
  const session = useSession()
  const role = (session?.data?.user as any)?.role as string | undefined;
  console.log(session);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-zinc-600">Welcome{session?.data?.user?.name ? ", " + session.data?.user?.name : ""}.</p>
      {role && (
        <p className="text-sm text-zinc-500">You are signed in as {role}.</p>
      )}
    </div>
  );
}


