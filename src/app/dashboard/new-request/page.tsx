"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().min(5),
});

export default function NewRequestPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { subject: "", startDate: "", endDate: "", description: "" },
  });

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success("Request submitted");
      router.push("/dashboard/requests");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error || "Failed to submit");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Offday Request</h1>
          <p className="mt-2 text-sm text-gray-600">Submit a new request for time off</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="Enter request subject"
                  {...form.register("subject")} 
                />
                {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start" className="text-base font-medium">Start Date</Label>
                  <Input id="start" type="date" {...form.register("startDate")} />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end" className="text-base font-medium">End Date</Label>
                  <Input id="end" type="date" {...form.register("endDate")} />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-base font-medium">Description</Label>
                <Textarea 
                  id="desc" 
                  rows={5} 
                  placeholder="Provide details about your request"
                  {...form.register("description")} 
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="w-full"
                size="lg"
              >
                {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


