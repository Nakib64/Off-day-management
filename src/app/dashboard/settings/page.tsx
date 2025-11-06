"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loading from "@/components/Loading";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
});

async function fetchProfile() {
  const res = await fetch("/api/user/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

async function updateProfile(data: z.infer<typeof ProfileSchema>) {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update profile");
  }
  return res.json();
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
  });

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      department: "",
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        department: profile.department || "",
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data);
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const onSubmit = (values: z.infer<typeof ProfileSchema>) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return <Loading text="Loading profile..." fullScreen />;
  }

  return (
    <>
      {/* Logout Button fixed at top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            await signOut({ callbackUrl: "/" });
            toast.success("Logged out successfully");
          }}
          aria-label="Logout"
          title="Logout"
        >
          Logout
        </Button>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information. Email cannot be changed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter your name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...form.register("department")}
                    placeholder="Enter your department"
                  />
                  {form.formState.errors.department && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.department.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={
                      profile?.role
                        ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                        : ""
                    }
                    disabled
                    className="bg-muted capitalize"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
