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
import { Eye, Check, X, Loader2 } from "lucide-react";

export default function RequestsTable({
  requests,
  loadingButton,
  mutation,
  onApprove,
  onRejectClick,
  onViewDetails,
}: {
  requests: any[];
  loadingButton: { id: string; action: "approve" | "reject" | null } | null;
  mutation: any;
  onApprove: (id: string, email: string, startDate:string, endDate: string) => void;
  onRejectClick: (id: string) => void;
  onViewDetails: (req: any) => void;
}) {
  return (
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
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((req) => (
              <TableRow key={req._id}>
                <TableCell className="text-center">{req.subject || "N/A"}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{req.teacherEmail || "N/A"}</TableCell>
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
                    {req.status?.replace("_", " ").toUpperCase() || "PENDING"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(req)}
                      title="View Details"
                      disabled={loadingButton?.id === req._id}
                    >
                      {loadingButton && loadingButton.id === req._id && loadingButton.action === null ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onApprove(req._id, req.teacherEmail, req.startDate, req.endDate)}
                      disabled={mutation.isLoading || req.status !== "in_progress"}
                      title="Approve"
                    >
                      {loadingButton && loadingButton.id === req._id && loadingButton.action === "approve" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      ) : (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRejectClick(req._id)}
                      disabled={mutation.isLoading || req.status !== "in_progress"}
                      title="Reject"
                    >
                      {loadingButton && loadingButton.id === req._id && loadingButton.action === "reject" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
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
