"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import { Search } from "lucide-react";

import RequestsTable from "./RequestsTable";
import ViewRequestModal from "./ViewRequestModal";
import RejectModal from "../RejectModal";
import Loading from "@/components/Loading";

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
    console.log(data);
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

  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [loadingButton, setLoadingButton] = useState<{ id: string; action: "approve" | "reject" | null } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", { status: statusFilter, search: searchQuery, page: currentPage, limit: itemsPerPage }],
    queryFn: fetchChairmanRequests,
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; action: string; message?: string, email:string , start: string, end:string}) =>
      updateStatus(vars.id, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Status updated");
      setRejectOpen(false);
      setRejectingId(null);
      setViewingRequest(null);
      setLoadingButton(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
      setLoadingButton(null);
    },
  });

  function handleApprove(id: string, email: string,  startDate:string, endDate: string,) {
    setLoadingButton({ id, action: "approve" });
    mutation.mutate(
      { id, action: "accept", email: email , start:startDate, end:endDate},
      {
        onSettled: () => setLoadingButton(null),
      }
    );
  }

  function onRejectClick(id: string) {
    setRejectingId(id);
    setRejectOpen(true);
  }

  function onRejectConfirm(reason: string) {
    if (!rejectingId) return;
    setLoadingButton({ id: rejectingId, action: "reject" });
    mutation.mutate(
      { id: rejectingId, action: "reject", message: reason , email: '', start:'', end: ''},
      {
        onSettled: () => setLoadingButton(null),
      }
    );
  }



  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">Error loading requests</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );

  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages;
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by teacher email or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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
{isLoading ? <Loading text="Loading requests..." /> :
        <RequestsTable
          requests={paginatedData}
          loadingButton={loadingButton}
          mutation={mutation}
          onApprove={handleApprove}
          onRejectClick={onRejectClick}
          onViewDetails={setViewingRequest}
        />}

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>

      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={onRejectConfirm} loading={mutation.isPending} />

      {viewingRequest && (
        <ViewRequestModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
          onApprove={() => handleApprove(viewingRequest._id, '', '', '')}
          onReject={() => {
            setRejectingId(viewingRequest._id);
            setRejectOpen(true);
            setViewingRequest(null);
          }}
          loading={mutation.isPending}
        />
      )}
    </>
  );
}
