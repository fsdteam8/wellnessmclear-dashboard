"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useSession } from "next-auth/react";
import { PuffLoader } from "react-spinners";

// Types
type PromoCodeFormData = {
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  expiryDate: Date | undefined;
  usageLimit: number;
  active: boolean;
};

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
}

type ApiResponse = {
  status: boolean;
  message: string;
  data?: Record<string, unknown>; // Instead of `any`
};

// API function to create promo code
const createPromoCode = async (
  data: PromoCodeFormData,
  token: string
): Promise<ApiResponse> => {
  const payload = {
    code: data.code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    expiryDate: data.expiryDate?.toISOString(),
    usageLimit: data.usageLimit,
    active: data.active,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create promo code");
  }

  return response.json();
};

export default function AddCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  console.log("session", session);

  const accessToken = session?.accessToken;
  console.log("acc", accessToken);

  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    discountType: "Percentage",
    discountValue: 0,
    expiryDate: undefined,
    usageLimit: 100,
    active: true,
  });

  const [discountInput, setDiscountInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: PromoCodeFormData) => {
      if (!accessToken) {
        throw new Error("No access token available");
      }
      return createPromoCode(data, accessToken);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });

      toast({
        title: "Success",
        description: data.message || "Promo code created successfully",
      });

      router.push("/promo-code");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): string | null => {
    if (!formData.code.trim()) return "Code is required";

    if (formData.code.length < 3 || formData.code.length > 20)
      return "Code must be between 3 and 20 characters";

    if (!/^[a-zA-Z0-9]+$/.test(formData.code))
      return "Code must be alphanumeric";

    if (!discountInput.trim()) return "Discount is required";

    if (formData.discountValue <= 0)
      return "Discount value must be greater than 0";

    if (formData.discountType === "Percentage" && formData.discountValue > 100)
      return "Percentage discount cannot exceed 100%";

    if (!formData.expiryDate) return "Expiry date is required";

    if (formData.expiryDate <= new Date())
      return "Expiry date must be in the future";

    if (formData.usageLimit <= 0) return "Usage limit must be greater than 0";

    return null;
  };

  const handleDiscountChange = (value: string) => {
    setDiscountInput(value);
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));

    if (!isNaN(numericValue)) {
      const isPercentage = value.includes("%");
      setFormData((prev) => ({
        ...prev,
        discountType: isPercentage ? "Percentage" : "Fixed",
        discountValue: numericValue,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleCancel = () => router.push("/promo-code");

  // Show loading state if session is loading or if we don't have a token yet
  if (!session || !accessToken) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6 mt-4">
              <h1 className="text-2xl font-semibold text-gray-900">Add Code</h1>
              <p className="text-sm text-gray-500">
                Dashboard &gt; Code &gt; Add Code
              </p>
            </div>
            <div className="flex h-screen items-center justify-center bg-gray-50">
              <div className="text-center">
                {/* Optional: Remove this if you only want MoonLoader */}
                {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div> */}
                <PuffLoader
                  color="rgba(49, 23, 215, 1)"
                  cssOverride={{}}
                  loading
                  speedMultiplier={1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Add Code</h1>
            <p className="text-sm text-gray-500">
              Dashboard &gt; Code &gt; Add Code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label
                  htmlFor="code"
                  className="block text-base font-medium text-black mb-3"
                >
                  Code (3-20 chars, alphanumeric) *
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  placeholder="e.g., SUMMER50"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="h-[60px] border-[1px] border-[#707070]"
                  maxLength={20}
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <Label
                  htmlFor="discount"
                  className="block text-base font-medium text-black mb-3"
                >
                  Discount *
                </Label>
                <Input
                  id="discount"
                  value={discountInput}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className="h-[60px] border-[1px] border-[#707070]"
                  placeholder="e.g., 50% or 10"
                  disabled={createMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Type: {formData.discountType} | Value:{" "}
                  {formData.discountValue}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div>
                <Label
                  htmlFor="expiryDate"
                  className="block text-base font-medium text-black mb-3"
                >
                  Expiry Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left font-normal border border-[#707070] rounded-md h-[60px]",
                        !formData.expiryDate && "text-muted-foreground"
                      )}
                      disabled={createMutation.isPending}
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label
                  htmlFor="usageLimit"
                  className="block text-base font-medium text-black mb-3"
                >
                  Usage Limit *
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-[60px] border-[1px] border-[#707070]"
                  placeholder="100"
                  min="1"
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <Label
                  htmlFor="status"
                  className="block text-base font-medium text-black mb-3"
                >
                  Status
                </Label>
                <Select
                  value={formData.active ? "Active" : "Inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, active: value === "Active" })
                  }
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger className="h-[60px] border-[#707070] rounded-md">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
                className="h-[45px] w-[120px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-slate-700 hover:bg-slate-800 text-white h-[45px] w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>

          {createMutation.isPending && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
                  <span className="text-lg font-medium">
                    Creating promo code...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
