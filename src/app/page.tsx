"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";

type LoginFormData = {
  email: string;
  password: string;
};

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  role: "teacher" | "director" | "chairman";
};

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard/requests");
    }
  }, [session, router]);

  const loginForm = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    defaultValues: { name: "", email: "", password: "", role: "teacher" },
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
      toast.error(res?.error || "Invalid credentials");
    }
  };

  const onRegister = async (values: RegisterFormData) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success("Account created successfully!");
      registerForm.reset();
      setActiveTab("login");
      // Pre-fill email in login form
      loginForm.setValue("email", values.email);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error || "Failed to register");
    }
  };

  // Sample credentials list
  const sampleCredentials = [
    { label: "Teacher", email: "nafiz.240140@s.pust.ac.bd", password: "nakib1" },
    { label: "Director", email: "rahim@gmail.com", password: "rahim1" },
    { label: "Chairman", email: "sajjad@gmail.com", password: "sajjad1" },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Offday Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                className="space-y-4 pt-4"
                onSubmit={loginForm.handleSubmit(onLogin)}
              >
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
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.email.message}
                    </p>
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
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                {/* Sample Credentials */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Sample Credentials:</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    {sampleCredentials.map(({ label, email, password }) => (
                      <div
                        key={email}
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          loginForm.setValue("email", email, { shouldValidate: true, shouldDirty: true });
                          loginForm.setValue("password", password, { shouldValidate: true, shouldDirty: true });
                          toast.message(`Filled credentials for ${label}`);
                        }}
                      >
                        <strong>{label}:</strong> {email} / {password}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form
                className="space-y-4 pt-4"
                onSubmit={registerForm.handleSubmit(onRegister)}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    {...registerForm.register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.name.message}
                    </p>
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
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <PasswordInput
                    id="reg-password"
                    {...registerForm.register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.password.message}
                    </p>
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
                  {registerForm.formState.isSubmitting
                    ? "Creating account..."
                    : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
