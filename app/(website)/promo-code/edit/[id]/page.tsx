"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

// Types
type PromoCodeFormData = {
  code: string;
  discount: number;
  expiryDate: Date | undefined;
  usageLimit: number;
  status: "Active" | "Inactive";
};

type PromoCodeResponse = {
  _id: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  startDate: string;
  expiryDate: string;
  active: boolean;
  usageLimit: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  status: boolean;
  message: string;
  data?: PromoCodeResponse;
};

// Utility function to safely create a Date object
const createSafeDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  
  const date = new Date(dateString);
  return isValid(date) ? date : undefined;
};

// API Functions
const fetchPromoCode = async (id: string): Promise<ApiResponse> => {
  console.log(`Fetching promo code with ID: ${id}`);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log('Fetch response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Fetch error:', errorData);
    throw new Error(errorData.message || `Failed to fetch promo code (${response.status})`);
  }

  const data = await response.json();
  console.log('Fetched data:', data);
  return data;
};

const updatePromoCode = async (
  id: string,
  data: PromoCodeFormData,
  token: string // Add token as parameter
): Promise<ApiResponse> => {
  const payload = {
    code: data.code,
    discountValue: data.discount,
    expiryDate: data.expiryDate?.toISOString(),
    usageLimit: data.usageLimit,
    active: data.status === "Active",
  };

  console.log('Update payload:', payload);

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/promo-codes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Use the token parameter
    },
    body: JSON.stringify(payload),
  });

  console.log('Update response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Update error:', errorData);
    throw new Error(errorData.message || `Failed to update promo code (${response.status})`);
  }

  const result = await response.json();
  console.log('Update result:', result);
  return result;
};

export default function EditCodePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const codeId = params.id as string;

  const { data: session } = useSession(); // Destructure properly
  console.log("session", session);

  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    discount: 0,
    expiryDate: undefined,
    usageLimit: 100,
    status: "Active",
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: PromoCodeFormData) => {
      console.log('Mutation called with data:', data);
      
      // Check if token exists
      if (!session?.accessToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      return updatePromoCode(codeId, data, session.accessToken);
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });

      toast({
        title: "Success",
        description: data.message || "Promo code updated successfully",
      });

      router.push("/promo-code");
    },
    onError: (error: Error) => {
      console.error('Update failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update promo code",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const loadCodeData = async () => {
      if (!codeId) {
        toast({
          title: "Error",
          description: "Invalid promo code ID",
          variant: "destructive",
        });
        router.push("/promo-code");
        return;
      }

      setIsLoadingData(true);
      try {
        const response = await fetchPromoCode(codeId);
        
        if (response.status && response.data) {
          const promoCode = response.data;
          
          const expiryDate = createSafeDate(promoCode.expiryDate);

          console.log("Original expiryDate:", promoCode.expiryDate);
          console.log("Parsed expiryDate:", expiryDate);

          setFormData({
            code: promoCode.code,
            discount: promoCode.discountValue,
            expiryDate: expiryDate,
            usageLimit: promoCode.usageLimit || 100,
            status: promoCode.active ? "Active" : "Inactive",
          });

          if (!expiryDate) {
            toast({
              title: "Warning",
              description: "Expiry date could not be parsed correctly. Please verify the date before saving.",
              variant: "destructive",
            });
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error loading promo code:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load promo code data",
          variant: "destructive",
        });
        router.push("/promo-code");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCodeData();
  }, [codeId, router, toast]);

  // Form validation
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = "Code is required";
    } else if (formData.code.length < 3 || formData.code.length > 20) {
      errors.code = "Code must be between 3 and 20 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.code)) {
      errors.code = "Code must be alphanumeric";
    }

    if (formData.discount <= 0) {
      errors.discount = "Discount value must be greater than 0";
    }

    if (!formData.expiryDate) {
      errors.expiryDate = "Expiry date is required";
    }

    if (formData.usageLimit <= 0) {
      errors.usageLimit = "Usage limit must be greater than 0";
    }

    return errors;
  };

  const handleCodeChange = (value: string) => {
    const cleanedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      code: cleanedValue,
    }));
    
    if (formErrors.code) {
      setFormErrors(prev => ({ ...prev, code: "" }));
    }
  };

  const handleDiscountChange = (value: string) => {
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    
    const parts = cleanedValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : cleanedValue;

    const numericValue = parseFloat(formattedValue);

    if (!isNaN(numericValue) && numericValue >= 0) {
      setFormData((prev) => ({
        ...prev,
        discount: numericValue,
      }));
    } else if (formattedValue === "" || formattedValue === ".") {
      setFormData((prev) => ({
        ...prev,
        discount: 0,
      }));
    }
    
    if (formErrors.discount) {
      setFormErrors(prev => ({ ...prev, discount: "" }));
    }
  };

  const handleUsageLimitChange = (value: string) => {
    const numericValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      usageLimit: numericValue,
    }));
    
    if (formErrors.usageLimit) {
      setFormErrors(prev => ({ ...prev, usageLimit: "" }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "Active" | "Inactive",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);

    // Check authentication before validation
    if (!session?.accessToken) {
      toast({
        title: "Authentication Error",
        description: "You are not authenticated. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    console.log('Form validation passed, calling mutation...');
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    router.push("/promo-code");
  };

  const formatSafeDate = (date: Date | undefined): string => {
    if (!date || !isValid(date)) {
      return "DD / MM / YYYY";
    }
    return format(date, "dd / MM / yyyy");
  };

  // Show loading if session is loading or data is loading
  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading promo code...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Promo Code", href: "/promo-code" },
              { label: "Edit Code" },
            ]}
          />

          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Code</h1>
            <p className="text-sm text-gray-500">Dashboard &gt; Code &gt; Edit Code</p>
          </div>

          <div className="">
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
                    type="text"
                    value={formData.code}
                    placeholder="e.g., SUMMER50"
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className={cn(
                      "h-[60px] border-[1px]",
                      formErrors.code ? "border-red-500" : "border-[#707070]"
                    )}
                    maxLength={20}
                    disabled={updateMutation.isPending}
                  />
                  {formErrors.code && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>
                  )}
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
                    type="number"
                    value={formData.discount || ""}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className={cn(
                      "h-[60px] border-[1px]",
                      formErrors.discount ? "border-red-500" : "border-[#707070]"
                    )}
                    placeholder="e.g., 50 or 10.5"
                    min="0"
                    step="0.01"
                    disabled={updateMutation.isPending}
                  />
                  {formErrors.discount && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.discount}</p>
                  )}
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
                        type="button"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left font-normal border rounded-md h-[60px]",
                          formErrors.expiryDate ? "border-red-500" : "border-[#707070]",
                          !formData.expiryDate && "text-muted-foreground"
                        )}
                        disabled={updateMutation.isPending}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiryDate && isValid(formData.expiryDate) ? (
                          formatSafeDate(formData.expiryDate)
                        ) : (
                          <span>DD / MM / YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiryDate}
                        onSelect={(date) => {
                          setFormData({ ...formData, expiryDate: date });
                          if (formErrors.expiryDate) {
                            setFormErrors(prev => ({ ...prev, expiryDate: "" }));
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>
                  )}
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
                    onChange={(e) => handleUsageLimitChange(e.target.value)}
                    className={cn(
                      "h-[60px] border-[1px]",
                      formErrors.usageLimit ? "border-red-500" : "border-[#707070]"
                    )}
                    placeholder="100"
                    min="1"
                    disabled={updateMutation.isPending}
                  />
                  {formErrors.usageLimit && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.usageLimit}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="block text-base font-medium text-black mb-3"
                  >
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                    disabled={updateMutation.isPending}
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
                  disabled={updateMutation.isPending}
                  className="h-[45px] w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !session?.accessToken}
                  className="bg-slate-700 hover:bg-slate-800 text-white h-[45px] w-[150px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {updateMutation.isPending && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
                  <span className="text-lg font-medium">
                    Updating promo code...
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