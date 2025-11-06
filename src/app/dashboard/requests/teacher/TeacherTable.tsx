"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { toast } from "sonner";
import RequestTable from "./RequestTable";
import EditRequestDialog from "./EditRequestDialog";
import DeleteRequestDialog from "./DeleteRequestDialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const EditSchema = z.object({
  subject: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().min(5),
});

async function fetchTeacherRequests({ queryKey }: any) {
  const [_key, { status, page, limit }] = queryKey;
  const params = new URLSearchParams({
    ...(status !== "all" && { status }),
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(`/api/requests?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

async function updateRequest(id: string, data: z.infer<typeof EditSchema>) {
  const res = await fetch(`/api/requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update request");
  }
  return res.json();
}

async function deleteRequest(id: string) {
  const res = await fetch(`/api/requests/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete request");
  }
  return res.json();
}

export default function TeacherRequests() {
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", { status: statusFilter, page: currentPage, limit: itemsPerPage }],
    queryFn: fetchTeacherRequests,
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: z.infer<typeof EditSchema> }) =>
      updateRequest(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["requests", { status: statusFilter }],
      });
      toast.success("Request updated successfully");
      setEditOpen(false);
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update request");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["requests", { status: statusFilter }],
      });
      toast.success("Request deleted successfully");
      setDeleteOpen(false);
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete request");
    },
  });

  const handleEdit = (req: any) => {
    setSelectedRequest(req);
    setEditOpen(true);
  };

  const handleDelete = (req: any) => {
    setSelectedRequest(req);
    setDeleteOpen(true);
  };

  const onEditSubmit = (values: z.infer<typeof EditSchema>) => {
    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest._id, data: values });
    }
  };

  const onDeleteConfirm = () => {
    if (selectedRequest) {
      deleteMutation.mutate(selectedRequest._id);
    }
  };

  if (isLoading) {
    return <Loading text="Loading requests..." fullScreen={false} className="min-h-[400px]" />;
  }

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
  const totalPages = data?.totalPages;
  const paginatedData = data?.requests || [];

  return (
    <>
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your offday requests</p>
        </div>

        <RequestTable
          requests={paginatedData}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalItems={totalItems}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          updateLoading={updateMutation.isPending}
          deleteLoading={deleteMutation.isPending}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <EditRequestDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        request={selectedRequest}
        onSubmit={onEditSubmit}
        loading={updateMutation.isPending}
      />

      <DeleteRequestDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
