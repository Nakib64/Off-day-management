import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export default function ViewRequestModal({
  request,
  onClose,
  onApprove,
  onReject,
  loading,
}: {
  request: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full p-6 relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Request Details</h2>
        <div className="space-y-2 text-sm text-gray-800">
          <div>
            <strong>Teacher Email:</strong> {request.teacherEmail || "N/A"}
          </div>
          <div>
            <strong>Subject:</strong> {request.subject || "N/A"}
          </div>
          <div>
            <strong>Start Date:</strong> {formatDate(request.startDate)}
          </div>
          <div>
            <strong>End Date:</strong> {formatDate(request.endDate)}
          </div>
          <div>
            <strong>Days:</strong> {request.days}
          </div>
          <div>
            <strong>Description:</strong> {request.description || "N/A"}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                request.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : request.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : request.status === "in_progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {request.status?.replace("_", " ").toUpperCase() || "PENDING"}
            </span>
          </div>
          <div>
            <strong>Created At:</strong> {formatDate(request.createdAt)}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onApprove}
            disabled={loading || request.status !== "in_progress"}
            title="Approve"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-green-600" /> : <Check className="w-5 h-5 text-green-600" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onReject}
            disabled={loading || request.status !== "in_progress"}
            title="Reject"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-red-600" /> : <X className="w-5 h-5 text-red-600" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
