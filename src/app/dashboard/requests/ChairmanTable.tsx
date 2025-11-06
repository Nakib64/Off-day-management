"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import RejectModal from "./RejectModal";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { Search } from "lucide-react";

async function fetchChairmanRequests({ queryKey }: any) {
  const [_key, { status, search, page, limit }] = queryKey;
  const params = new URLSearchParams({
    ...(status !== "all" && { status }),
    ...(search && { search }),
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(`/api/requests?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

async function updateStatus(id: string, payload: any) {
  const res = await fetch(`/api/requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update status");
  }
  return res.json();
}

export default function ChairmanRequests() {
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "requests",
      {
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
      },
    ],
    queryFn: fetchChairmanRequests,
    
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; action: string; message?: string }) =>
      updateStatus(vars.id, { action: vars.action, message: vars.message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Status updated");
      setRejectOpen(false);
      setRejectingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  function handleApprove(id: string) {
    mutation.mutate({ id, action: "accept" });
  }

  function onRejectClick(id: string) {
    setRejectingId(id);
    setRejectOpen(true);
  }

  function onRejectConfirm(reason: string) {
    if (!rejectingId) return;
    mutation.mutate({ id: rejectingId, action: "reject", message: reason });
  }

  if (isLoading) return <Loading text="Loading requests..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">Error loading requests</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages
  const paginatedData = data?.requests || [];

  return (
    <>
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Off Day Requests</h1>
          <p className="mt-2 text-sm text-gray-600">Review and approve offday requests</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by teacher email or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
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
          </div>
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing {paginatedData.length} of {totalItems} requests
          </div>
        </div>
        {isLoading ?  <Loading text="Loading requests..." />:
        <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Subject</TableHead>
                <TableHead className="text-center hidden md:table-cell">Teacher Email</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchQuery || statusFilter !== "all"
                      ? "No requests match your filters."
                      : "No requests found."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((req: any) => (
                  <TableRow key={req._id}>
                    <TableCell className="text-center">{req.subject || "N/A"}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">{req.teacherEmail || "N/A"}</TableCell>
                    <TableCell className="text-center">{req.days}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        req.status === "accepted" ? "bg-green-100 text-green-800" :
                        req.status === "rejected" ? "bg-red-100 text-red-800" :
                        req.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {req.status?.replace("_", " ").toUpperCase() || "PENDING"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req._id)}
                          disabled={mutation.isPending || req.status !== "in_progress"}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRejectClick(req._id)}
                          disabled={mutation.isPending || req.status !== "in_progress"}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={onRejectConfirm}
        loading={mutation.isPending}
      />
    </>
  );
}
