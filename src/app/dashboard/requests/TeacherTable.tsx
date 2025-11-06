"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { Edit2, Trash2 } from "lucide-react";

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

  const form = useForm<z.infer<typeof EditSchema>>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      subject: "",
      startDate: "",
      endDate: "",
      description: "",
    },
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
      form.reset();
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
    const startDate = new Date(req.startDate).toISOString().split("T")[0];
    const endDate = new Date(req.endDate).toISOString().split("T")[0];
    form.reset({
      subject: req.subject || "",
      startDate,
      endDate,
      description: req.description,
    });
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
  console.log(data);

  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages;
  const paginatedData = data?.requests || [];

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();

  return (
    <>
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your offday requests</p>
        </div>

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
            Showing {paginatedData.length} of {totalItems} requests
          </div>
        </div>
        {isLoading ? <Loading text="Loading requests..." /> :
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
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {statusFilter === "all"
                        ? "No requests found. Create your first request!"
                        : `No ${statusFilter.replace("_", " ")} requests found.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((req: any) => (
                    <TableRow key={req._id}>
                      <TableCell className="text-center">{req.subject}</TableCell>
                      <TableCell className="text-center">{formatDate(req.startDate)}</TableCell>
                      <TableCell className="text-center">{formatDate(req.endDate)}</TableCell>
                      <TableCell className="text-center">{req.description}</TableCell>
                      <TableCell className="text-center">{req.days}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${req.status === "accepted"
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
                            disabled={req.status !== "pending" || updateMutation.isPending}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(req)}
                            disabled={req.status !== "pending" || deleteMutation.isPending}
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              Update your offday request details. You can only edit pending requests.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter request subject" {...form.register("subject")} />
              {form.formState.errors.subject && (
                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...form.register("startDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" {...form.register("endDate")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                {...form.register("description")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
