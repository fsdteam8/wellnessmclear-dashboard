"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
// import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function AddSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubcategory = () => {
  	router.push(`/categories/${category}/add`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sub-category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Sub-category created successfully",
      });
      router.push(`/categories/${category}`);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6 ">
            <div>
              <PageHeader onButtonClick={handleAddSubcategory} title="Entertainment List" buttonText="Add sub_category" />
              <p className="text-gray-500 -mt-4">
                Dashboard &gt; category &gt; sub_category
              </p>
            </div>
          </div>

          <div className="pt-10">
            <h2 className="text-lg font-semibold mb-6">
              Sub_categories Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">sub_category Name</Label>
                <Input
                  id="name"
                  placeholder="Type sub_category name here..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-3 h-[50px] border border-[#707070]"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type sub_category description here..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 min-h-[120px] border border-[#707070]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <span>
                    <Save />
                  </span>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
