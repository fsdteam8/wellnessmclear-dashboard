"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

export default function AddPracticeAreaPage() {
  const router = useRouter();
  // const { toast } = useToast();

  const session = useSession();
  console.log("session", session);

  const TOKEN = session?.data?.accessToken;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/practice-area`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create practice-area");
      }

      return response.json();
    },
    onSuccess: (success) => {
      toast.success(success.message)
      router.push("/practice-area");
    },
    onError: (error) => {
      toast.error(error.message)
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Practice-area name is required");
      return;
    }

    // Log form data
    console.log("Form Data Submitted:", formData);

    mutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-[#EDEEF1] p-6">
      <div className="flex-1 overflow-auto">
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Add Practice-area</h1>
            <p className="text-gray-500">Dashboard &gt; Practice-area</p>
          </div>

          <div className="pt-10">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Practice-area Name</Label>
                <Input
                  id="name"
                  placeholder="Type category name here..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-3 h-[50px] border border-[#707070]"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type category description here..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[120px] border border-[#707070]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <span className="mr-2"><Save /></span>
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

