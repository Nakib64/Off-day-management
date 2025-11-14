"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";

type LoginFormData = {
  email: string;
  password: string;
};

const sampleCredentials = [
  { label: "Teacher", email: "nafiz.240140@s.pust.ac.bd", password: "nakib1" },
  { label: "Director", email: "rahim@gmail.com", password: "rahim1" },
  { label: "Chairman", email: "sajjad@gmail.com", password: "sajjad1" },
];

export default function LoginForm() {
  const router = useRouter();
  const loginForm = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
  });

  const onLogin = async (values: LoginFormData) => {
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (res?.ok) {
      toast.success("Welcome back!");
      router.replace("/dashboard/requests");
    } else {
      toast.error("Invalid email or password");
    }
  };

  // Autofill handler when clicking sample credential
  const handleFillCredentials = (email: string, password: string, label: string) => {
    loginForm.setValue("email", email, { shouldValidate: true, shouldDirty: true });
    loginForm.setValue("password", password, { shouldValidate: true, shouldDirty: true });
    toast.message(`Filled credentials for ${label}`);
  };

  return (
    <>
      <form className="space-y-4 pt-4" onSubmit={loginForm.handleSubmit(onLogin)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...loginForm.register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {loginForm.formState.errors.email && (
            <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            {...loginForm.register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {loginForm.formState.errors.password && (
            <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={loginForm.formState.isSubmitting}>
          {loginForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {/* Sample credentials list */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-xs font-semibold text-blue-900 mb-2">Sample Credentials:</p>
        <div className="space-y-1 text-xs text-blue-800">
          {sampleCredentials.map(({ label, email, password }) => (
            <div
              key={email}
              className="cursor-pointer hover:underline"
              onClick={() => handleFillCredentials(email, password, label)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFillCredentials(email, password, label);
                }
              }}
              role="button"
              aria-label={`Fill credentials for ${label}`}
            >
              <strong>{label}:</strong> {email} / {password}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
