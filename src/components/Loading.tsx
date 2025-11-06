"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  text, 
  size = "md", 
  fullScreen = false,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-[3px]",
    lg: "border-4",
  };

  const containerClasses = fullScreen
    ? "flex items-center justify-center min-h-[calc(100vh-8rem)]"
    : "flex items-center justify-center";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer spinning ring */}
          <div
            className={cn(
              sizeClasses[size],
              borderClasses[size],
              "border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent rounded-full animate-spin"
            )}
          />
          {/* Inner pulsing circle */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2.5 h-2.5" : "w-4 h-4",
              "bg-blue-600 rounded-full animate-pulse"
            )}
          />
        </div>
        {text && (
          <p className="text-sm font-medium text-gray-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Spinner variant for inline use
export function LoadingSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        "border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent rounded-full animate-spin",
        className
      )}
    />
  );
}

// Skeleton loader for table rows
export function TableSkeleton({ rows = 5, columns = 7 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

