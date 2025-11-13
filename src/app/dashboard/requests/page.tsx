"use client";

import { useSession } from "next-auth/react";
import TeacherTable from "./teacher/TeacherTable"; 
import DirectorTable from "./DirectorTable";
import ChairmanTable from "./chairman/ChairmanTable";
import Loading from "@/components/Loading";

export default function RequestsPage() {
  const { data: session, status } = useSession();

  console.log(session);
  if (status === "loading") return <Loading text="Loading..." fullScreen />;
  if (!session || !(session.user as any)?.role) return <Loading text="Unauthorized" fullScreen />;

  const role = (session.user as any).role as string;

  if (role === "teacher") return <TeacherTable />;
  if (role === "director") return <DirectorTable />;
  if (role === "chairman") return <ChairmanTable />;

  return <p>Role not recognized</p>;
}
