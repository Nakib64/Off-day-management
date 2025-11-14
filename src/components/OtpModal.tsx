"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OtpModalProps = {
  email: string;
  onClose: () => void;
  onVerified: () => void;
};

export default function OtpModal({ email, onClose, onVerified }: OtpModalProps) {
  const otpForm = useForm<{ otp: string }>({
    defaultValues: { otp: "" },
  });

  const onSubmit = async (values: { otp: string }) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: values.otp }),
      });

      if (res.ok) {
        onVerified();
      } else {
        const data = await res.json();
        alert(data.error || "Invalid OTP");
      }
    } catch {
      alert("Network error during OTP verification");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Enter OTP sent to {email}</h3>
        <form onSubmit={otpForm.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="text"
            maxLength={6}
            {...otpForm.register("otp", {
              required: "OTP is required",
              pattern: { value: /^[0-9]{6}$/, message: "OTP must be 6 digits" },
            })}
          />
          {otpForm.formState.errors.otp && (
            <p className="text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
          )}
          <div className="flex justify-between">
            <Button type="submit" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
