"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Save } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AddCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    startDate: undefined as Date | undefined,
    expiryDate: undefined as Date | undefined,
    status: "Active",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.code.trim() ||
      !formData.discount.trim() ||
      !formData.startDate ||
      !formData.expiryDate
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.code.length < 5 || formData.code.length > 10) {
      toast({
        title: "Error",
        description: "Code must be between 5 and 10 characters",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(formData.code)) {
      toast({
        title: "Error",
        description: "Code must be alphanumeric",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Promo code created successfully",
      });
      router.push("/promo-code");
    }, 1000);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Promo Code", href: "/promo-code" }, // Updated breadcrumb
              { label: "Add Code" },
            ]}
          />

          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Add Code</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; code</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label
                    htmlFor="code"
                    className="block text-base font-medium text-black mb-3"
                  >
                    Code (5-10 chars, alphanumeric)
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="h-[60px]"
                    maxLength={10}
                    minLength={5}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="discount"
                    className="block text-base font-medium text-black mb-3"
                  >
                    Discount
                  </Label>
                  <Input
                    id="discount"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="h-[60px]"
                    placeholder="e.g., $10 or 10%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div>
                  <Label
                    htmlFor="startDate"
                    className="block text-base font-medium text-black mb-3"
                  >
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-3 h-[60px]",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "dd / MM / yyyy")
                        ) : (
                          <span>DD / MM / YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, startDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label
                    htmlFor="expiryDate"
                    className="block text-base font-medium text-black mb-3"
                  >
                    Expiry Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 h-[60px]",
                          !formData.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiryDate ? (
                          format(formData.expiryDate, "dd / MM / yyyy")
                        ) : (
                          <span>DD / MM / YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiryDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, expiryDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="block text-base font-medium text-black mb-3"
                  >
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="mt-1 h-[60px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Schedule">Schedule</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-slate-700 hover:bg-slate-800 text-white h-[60px]"
                >
                  <Save className="h-4 w-4 mr-2" />
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
