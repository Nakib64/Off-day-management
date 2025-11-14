import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function TeachersTable({
  teachers,
}: {
  teachers: any[];
}) {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Teacher name</TableHead>
            <TableHead className="text-center hidden md:table-cell">Teacher Email</TableHead>
            <TableHead className="text-center hidden md:table-cell">Position</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No teachers found.
              </TableCell>
            </TableRow>
          ) : (
            teachers.map((req) => (
              <TableRow key={req._id}>
                <TableCell className="text-center">{req.name || "N/A"}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{req.email || "N/A"}</TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {req.role ? req.role.charAt(0).toUpperCase() + req.role.slice(1).toLowerCase() : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${req.status === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"

                      }`}
                  >
                    {req.status?.replace("_", " ").toUpperCase() || "PENDING"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button size={"sm"} variant={"ghost"} title="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
