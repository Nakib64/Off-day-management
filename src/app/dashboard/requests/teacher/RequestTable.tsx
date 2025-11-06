"use client";
import React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();

interface RequestTableProps {
  requests: any[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  totalItems: number;
  handleEdit: (req: any) => void;
  handleDelete: (req: any) => void;
  updateLoading: boolean;
  deleteLoading: boolean;
}

export default function RequestTable({
  requests,
  statusFilter,
  setStatusFilter,
  totalItems,
  handleEdit,
  handleDelete,
  updateLoading,
  deleteLoading,
}: RequestTableProps) {
  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto border rounded-md h-10 px-3 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {requests.length} of {totalItems} requests
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Subject</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">End Date</TableHead>
              <TableHead className="text-center">Description</TableHead>
              <TableHead className="text-center">Days</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {statusFilter === "all"
                    ? "No requests found. Create your first request!"
                    : `No ${statusFilter.replace("_", " ")} requests found.`}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell className="text-center">{req.subject}</TableCell>
                  <TableCell className="text-center">{formatDate(req.startDate)}</TableCell>
                  <TableCell className="text-center">{formatDate(req.endDate)}</TableCell>
                  <TableCell className="text-center">{req.description}</TableCell>
                  <TableCell className="text-center">{req.days}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        req.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : req.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : req.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {req.status.replace("_", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(req)}
                        disabled={req.status !== "pending" || updateLoading}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(req)}
                        disabled={req.status !== "pending" || deleteLoading}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
