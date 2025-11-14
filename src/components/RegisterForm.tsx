"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  role: "teacher" | "director" | "chairman";
};

type RegisterFormProps = {
  onOtpRequested: (email: string, data: RegisterFormData) => void;
};

export default function RegisterForm({ onOtpRequested }: RegisterFormProps) {
  const registerForm = useForm<RegisterFormData>({
    defaultValues: { name: "", email: "", password: "", role: "teacher" },
  });

  const onSubmit = async (values: RegisterFormData) => {
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (res.ok) {
        onOtpRequested(values.email, values);
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Network error during OTP request");
    }
  };

  return (
    <form className="space-y-4 pt-4" onSubmit={registerForm.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          {...registerForm.register("name", {
            required: "Name is required",
            minLength: { value: 2, message: "Name must be at least 2 characters" },
          })}
        />
        {registerForm.formState.errors.name && (
          <p className="text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          {...registerForm.register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
        />
        {registerForm.formState.errors.email && (
          <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <PasswordInput
          id="reg-password"
          {...registerForm.register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          })}
        />
        {registerForm.formState.errors.password && (
          <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          className="border rounded-md h-10 px-3"
          {...registerForm.register("role", { required: true })}
        >
          <option value="teacher">Teacher</option>
          <option value="director">Director</option>
          <option value="chairman">Chairman</option>
        </select>
        {registerForm.formState.errors.role && (
          <p className="text-sm text-red-600">Role is required</p>
        )}
      </div>

      <Button
        className="w-full"
        type="submit"
        disabled={registerForm.formState.isSubmitting}
      >
        {registerForm.formState.isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
