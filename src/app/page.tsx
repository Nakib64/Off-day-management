"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import OtpModal from "@/components/OtpModal";

import type { RegisterFormData } from "@/components/RegisterForm";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("login");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [registerData, setRegisterData] = useState<RegisterFormData | null>(null);

  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard/requests");
    }
  }, [session, router]);

  // Handle successful OTP request from RegisterForm
  function handleOtpRequested(email: string, data: RegisterFormData) {
    setOtpEmail(email);
    setRegisterData(data);
    setShowOtpModal(true);
    toast.success("OTP sent to your email.");
  }

  // Handle successful OTP verification
  async function handleOtpVerified() {
    if (!registerData) {
      toast.error("No registration data found.");
      setShowOtpModal(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (res.ok) {
        toast.success("Registration successful! You can now login.");
        setShowOtpModal(false);
        setActiveTab("login");
      } else {
        const data = await res.json();
        toast.error(data?.error || "Registration failed");
      }
    } catch {
      toast.error("Network error during registration");
    }
  }

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
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm onOtpRequested={handleOtpRequested} />
            </TabsContent>
          </Tabs>
        </CardContent>

        {showOtpModal && (
          <OtpModal
            email={otpEmail}
            onClose={() => setShowOtpModal(false)}
            onVerified={handleOtpVerified}
          />
        )}
      </Card>
    </div>
  );
}
