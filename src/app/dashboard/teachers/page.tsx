"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import { Search, Calendar } from "lucide-react";
import Loading from "@/components/Loading";
import TeachersTable from "./components/Teachers";

async function fetchTeachers({ queryKey }: any) {
  const [_key, { date, status, search, page, limit }] = queryKey;

  const params = new URLSearchParams({
    date,
    ...(status !== "all" && { status }),
    ...(search && { search }),
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(`/api/users/status?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch teachers");
  return res.json();
}

export default function Page() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize with today's date
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data, isLoading, error } = useQuery({
    queryKey: ["teachers", { date: selectedDate, status: statusFilter, search: searchQuery, page: currentPage, limit: itemsPerPage }],
    queryFn: fetchTeachers,
  });

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">Error loading teachers</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );

  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;
  const paginatedData = data?.teachers || [];

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <p className="mt-2 text-sm text-gray-600">View who’s available or on leave</p>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by teacher name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status */}
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto border rounded-md h-10 px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="date"
              value={selectedDate}
              min={today} // restrict to today or future
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 text-center sm:text-left">
          Showing {paginatedData.length} of {totalItems} teachers
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading text="Loading teachers..." />
      ) : (
        <TeachersTable teachers={paginatedData} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
