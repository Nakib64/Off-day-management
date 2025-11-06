"use client";
import React, { useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const EditSchema = z.object({
  subject: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().min(5),
});

interface EditRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any | null;
  onSubmit: (values: z.infer<typeof EditSchema>) => void;
  loading: boolean;
}

export default function EditRequestDialog({
  open,
  onOpenChange,
  request,
  onSubmit,
  loading,
}: EditRequestDialogProps) {
  const form = useForm<z.infer<typeof EditSchema>>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      subject: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  // Reset form values when modal opens or request changes
  React.useEffect(() => {
    if (request && open) {
      const startDate = new Date(request.startDate).toISOString().split("T")[0];
      const endDate = new Date(request.endDate).toISOString().split("T")[0];
      form.reset({
        subject: request.subject || "",
        startDate,
        endDate,
        description: request.description || "",
      });
    }
  }, [request, open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
          <DialogDescription>
            Update your offday request details. You can only edit pending requests.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Enter request subject" {...form.register("subject")} />
            {form.formState.errors.subject && (
              <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
