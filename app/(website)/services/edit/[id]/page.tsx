"use client";

import type React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  FileText,
  ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface Country {
  _id: string;
  countryName: string;
  states: string[];
}

interface PracticeArea {
  _id: string;
  name: string;
  description: string;
}

interface ResourceType {
  _id: string;
  resourceTypeName: string;
  description: string;
}

interface ResourceData {
  _id: string;
  title: string;
  country: string;
  states: string[];
  resourceType: string[];
  description: string;
  price: number;
  discountPrice: number;
  quantity: number;
  format: string;
  thumbnail: string;
  images: string[];
  practiceAreas: string[];
  file: {
    url: string;
    type: string;
  };
}

interface FormDataState {
  title: string;
  price: string;
  discountPrice: string;
  quantity: string;
  format: string;
  country: string;
  states: string[];
  description: string;
  practiceArea: string;
  resourceType: string;
  thumbnail: File | null;
  file: File | null;
  images: File[];
}

export default function EditPage() {
  const params = useParams();
  // const router = useRouter()
  const slug = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(
    null
  );
  const [existingFile, setExistingFile] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    price: "",
    discountPrice: "",
    quantity: "",
    format: "",
    country: "",
    states: [],
    description: "",
    practiceArea: "",
    resourceType: "",
    thumbnail: null,
    file: null,
    images: [],
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const session = useSession();
  const API_TOKEN = session?.data?.accessToken;

  // Memoize modules to prevent unnecessary re-renders
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "align",
    ],
    []
  );

  // Fetch single resource data
  const {
    data: resourceData,
    isLoading: isLoadingResource,
    error: resourceError,
  } = useQuery<ResourceData>({
    queryKey: ["resource", slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/resource/${slug}`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch resource");
      const data = await response.json();
      return data.data;
    },
    enabled: !!API_TOKEN && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: countriesData, isLoading: isLoadingCountries } = useQuery<
    Country[]
  >({
    queryKey: ["countries-all"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/country-state/all`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: !!API_TOKEN,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: practiceAreasData, isLoading: isLoadingPracticeAreas } =
    useQuery<PracticeArea[]>({
      queryKey: ["practiceAreas-all"],
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/practice-area/all`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch practice areas");
        const data = await response.json();
        return data.success ? data.data : [];
      },
      enabled: !!API_TOKEN,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });

  const { data: resourceTypesData, isLoading: isLoadingResourceTypes } =
    useQuery<ResourceType[]>({
      queryKey: ["resourceTypes-all"],
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/resource-type/all`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch resource types");
        const data = await response.json();
        return data.success ? data.data : [];
      },
      enabled: !!API_TOKEN,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });

  // Populate form data when resource data is loaded (only once)
  useEffect(() => {
    if (
      resourceData &&
      countriesData &&
      practiceAreasData &&
      resourceTypesData &&
      !isFormInitialized
    ) {
      // Find matching country
      const country = countriesData.find(
        (c) => c.countryName === resourceData.country
      );
      if (country) {
        setSelectedCountry(country);
      }

      // Find matching practice area
      const practiceArea = practiceAreasData.find((pa) =>
        resourceData.practiceAreas.includes(pa.name)
      );

      // Find matching resource type
      const resourceType = resourceTypesData.find((rt) =>
        resourceData.resourceType.includes(rt.resourceTypeName)
      );

      // Set form data in one batch update
      setFormData({
        title: resourceData.title || "",
        price: resourceData.price?.toString() || "",
        discountPrice: resourceData.discountPrice?.toString() || "",
        quantity: resourceData.quantity?.toString() || "",
        format: resourceData.format || "",
        country: resourceData.country || "",
        states: resourceData.states || [],
        description: resourceData.description || "",
        practiceArea: practiceArea?._id || "",
        resourceType: resourceType?._id || "",
        thumbnail: null,
        file: null,
        images: [],
      });

      setSelectedStates(resourceData.states || []);
      setExistingImages(resourceData.images || []);
      setExistingThumbnail(resourceData.thumbnail || null);
      setExistingFile(resourceData.file || null);
      setIsFormInitialized(true);
    }
  }, [
    resourceData,
    countriesData,
    practiceAreasData,
    resourceTypesData,
    isFormInitialized,
  ]);

  const { mutate: updateResource, isPending: isSubmitting } = useMutation({
    mutationFn: async (currentFormData: FormDataState) => {
      const submitData = new FormData();
      submitData.append("title", currentFormData.title);
      submitData.append("description", currentFormData.description);
      submitData.append("price", currentFormData.price);
      submitData.append("discountPrice", currentFormData.discountPrice);
      submitData.append("format", currentFormData.format);
      submitData.append("quantity", currentFormData.quantity);
      submitData.append("country", currentFormData.country);

      currentFormData.states.forEach((state) => {
        submitData.append("states[]", state);
      });

      const practiceAreaObj = practiceAreasData?.find(
        (p) => p._id === currentFormData.practiceArea
      );
      if (practiceAreaObj) {
        submitData.append("practiceAreas[]", practiceAreaObj.name);
      } else if (currentFormData.practiceArea) {
        submitData.append("practiceAreas[]", currentFormData.practiceArea);
      }

      const resourceTypeObj = resourceTypesData?.find(
        (rt) => rt._id === currentFormData.resourceType
      );
      if (resourceTypeObj) {
        submitData.append("resourceType[]", resourceTypeObj.resourceTypeName);
      } else if (currentFormData.resourceType) {
        submitData.append("resourceType[]", currentFormData.resourceType);
      }

      if (currentFormData.thumbnail) {
        submitData.append("thumbnail", currentFormData.thumbnail);
      }
      if (currentFormData.file) {
        submitData.append("file", currentFormData.file);
      }

      currentFormData.images.forEach((imageFile) => {
        submitData.append("images", imageFile);
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/resource/${slug}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to update resource: ${
            errorData.message || response.statusText
          }`
        );
      }
      return response.json();
    },
    onMutate: async (currentFormData) => {
      // Cancel any outgoing refetches for both individual resource and list
      await queryClient.cancelQueries({ queryKey: ["resource", slug] });
      await queryClient.cancelQueries({ queryKey: ["resources", "approved"] });

      // Snapshot the previous values
      const previousResource = queryClient.getQueryData(["resource", slug]);
      const previousResourcesList = queryClient.getQueryData([
        "resources",
        "approved",
      ]);

      // Optimistically update the individual resource
      if (resourceData) {
        const optimisticResource = {
          ...resourceData,
          title: currentFormData.title,
          price: Number(currentFormData.price),
          discountPrice: Number(currentFormData.discountPrice),
          quantity: Number(currentFormData.quantity),
          format: currentFormData.format,
          country: currentFormData.country,
          states: currentFormData.states,
          description: currentFormData.description,
        };
        queryClient.setQueryData(["resource", slug], optimisticResource);
      }

      // Return context for rollback
      return { previousResource, previousResourcesList };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousResource) {
        queryClient.setQueryData(["resource", slug], context.previousResource);
      }
      if (context?.previousResourcesList) {
        queryClient.setQueryData(
          ["resources", "approved"],
          context.previousResourcesList
        );
      }

      console.error("Error updating resource:", err);
      toast({
        title: "Error",
        description:
          err.message || "Failed to update resource. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log("Resource updated successfully:", data);

      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["resource", slug] });
      queryClient.invalidateQueries({ queryKey: ["resources", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] }); // Invalidate any other resource queries

      // Refetch the list immediately to ensure it's updated
      queryClient.refetchQueries({ queryKey: ["resources", "approved"] });

      toast({
        title: "Success!",
        description: "Resource has been updated successfully.",
        variant: "default",
      });

      // Optional: Navigate back to list after successful update
      // setTimeout(() => {
      //   router.push('/resource-list')
      // }, 1500)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["resource", slug] });
      queryClient.invalidateQueries({ queryKey: ["resources", "approved"] });
    },
  });

  // Optimized input change handler
  const handleInputChange = useCallback(
    (field: keyof FormDataState, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSelectedStates([]);
    setFormData((prev) => ({
      ...prev,
      country: country.countryName,
      states: [],
    }));
    setCountryOpen(false);
  }, []);

  const handleStateToggle = useCallback(
    (state: string) => {
      const newStates = selectedStates.includes(state)
        ? selectedStates.filter((s) => s !== state)
        : [...selectedStates, state];
      setSelectedStates(newStates);
      setFormData((prev) => ({ ...prev, states: newStates }));
    },
    [selectedStates]
  );

  const handleThumbnailUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;

      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }

      if (file) {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files for thumbnail.",
            variant: "destructive",
          });
          setFormData((prev) => ({ ...prev, thumbnail: null }));
          setThumbnailPreview(null);
          if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = "";
          }
          return;
        }
        setFormData((prev) => ({ ...prev, thumbnail: file }));
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        setFormData((prev) => ({ ...prev, thumbnail: null }));
        setThumbnailPreview(null);
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = "";
        }
      }
    },
    [thumbnailPreview, toast]
  );

  const handleRemoveThumbnail = useCallback(() => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
    setFormData((prev) => ({ ...prev, thumbnail: null }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }, [thumbnailPreview]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = event.target.files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        file: uploadedFile,
      }));
    },
    []
  );

  const handleImagesUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const newFiles = Array.from(files);
        const imageFiles = newFiles.filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length !== newFiles.length) {
          toast({
            title: "Invalid file type",
            description: "Some files were not images and were not added.",
            variant: "destructive",
          });
        }

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageFiles],
        }));
        setImagePreviews((prev) => [
          ...prev,
          ...imageFiles.map((file) => URL.createObjectURL(file)),
        ]);
      }
      if (event.target) {
        event.target.value = "";
      }
    },
    [toast]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      URL.revokeObjectURL(imagePreviews[indexToRemove]);
      setImagePreviews((prev) =>
        prev.filter((_, index) => index !== indexToRemove)
      );
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
      }));
    },
    [imagePreviews]
  );

  const handleRemoveExistingImage = useCallback((indexToRemove: number) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }, []);

  const handleSubmit = useCallback(() => {
    updateResource(formData);
  }, [updateResource, formData]);

  // Memoize filtered states to prevent unnecessary recalculations
  const filteredStates = useMemo(
    () =>
      selectedCountry?.states.filter((state) =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
      ) || [],
    [selectedCountry?.states, stateSearch]
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [thumbnailPreview, imagePreviews]);

  if (isLoadingResource) {
    return (
      <div className="max-w-9xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading resource data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (resourceError) {
    return (
      <div className="max-w-9xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Resource
            </h2>
            <p className="text-gray-600">
              Failed to load resource data. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 px-6">
        <PageHeader
          // onButtonClick={handleAddResource}
          title="Resource List Edit"
          // buttonText="Add Resource"
        />
        <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
      </div>
      <div className="max-w-9xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Edit Resource
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Title
                  </Label>
                  <Input
                    id="title"
                    className="h-[49px] border border-gray-500"
                    placeholder="Add your title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-base font-semibold">
                      Price
                    </Label>
                    <Input
                      className="h-[49px] border border-gray-500"
                      id="price"
                      placeholder="Add price.."
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-base font-semibold"
                      htmlFor="discountPrice"
                    >
                      Discount Price
                    </Label>
                    <Input
                      id="discountPrice"
                      className="h-[49px] border border-gray-500"
                      placeholder="Add Discount Price.."
                      value={formData.discountPrice}
                      onChange={(e) =>
                        handleInputChange("discountPrice", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-base font-semibold"
                      htmlFor="quantity"
                    >
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      className="h-[49px] border border-gray-500"
                      placeholder="Add Quantity.."
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold" htmlFor="format">
                      Format
                    </Label>
                    <Select
                      value={formData.format}
                      onValueChange={(value) =>
                        handleInputChange("format", value)
                      }
                    >
                      <SelectTrigger className="h-[49px] border border-gray-500">
                        <SelectValue placeholder="Add format.." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Document">Doc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className="w-full justify-between h-[49px] border"
                          disabled={isLoadingCountries}
                        >
                          {selectedCountry
                            ? selectedCountry.countryName
                            : "Select country..."}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countriesData?.map((country: Country) => (
                                <CommandItem
                                  key={country._id}
                                  value={country.countryName}
                                  onSelect={() => handleCountrySelect(country)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCountry?._id === country._id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.countryName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>States</Label>
                    <Popover open={stateOpen} onOpenChange={setStateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={stateOpen}
                          className="w-full justify-between h-[49px] border"
                          disabled={!selectedCountry}
                        >
                          {selectedStates.length > 0
                            ? `${selectedStates.length} state(s) selected`
                            : "Select states..."}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search states..."
                            value={stateSearch}
                            onValueChange={setStateSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup>
                              {filteredStates.map((state) => (
                                <CommandItem
                                  key={state}
                                  value={state}
                                  onSelect={() => handleStateToggle(state)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedStates.includes(state)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {state}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <div className="rounded-md border border-gray-300 h-[300px] overflow-hidden">
                    {typeof window !== "undefined" && (
                      <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={(content) =>
                          handleInputChange("description", content)
                        }
                        modules={modules}
                        formats={formats}
                        className="h-[300px] rounded-md"
                        style={{ height: "300px" }}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Practice Area & Resource Type */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Practice Area
                  </Label>
                  <Select
                    value={formData.practiceArea}
                    onValueChange={(value) =>
                      handleInputChange("practiceArea", value)
                    }
                  >
                    <SelectTrigger className="h-[49px] border border-gray-400">
                      <SelectValue placeholder="Select a practice area" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPracticeAreas ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        practiceAreasData?.map((area: PracticeArea) => (
                          <SelectItem key={area._id} value={area._id}>
                            {area.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 mt-4">
                  <Label className="text-base font-semibold">
                    Resource Type
                  </Label>
                  <Select
                    value={formData.resourceType}
                    onValueChange={(value) =>
                      handleInputChange("resourceType", value)
                    }
                  >
                    <SelectTrigger className="h-[49px] border border-gray-400">
                      <SelectValue placeholder="Select a resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingResourceTypes ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        resourceTypesData?.map((type: ResourceType) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.resourceTypeName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail-upload">
                    Thumbnail (Images Only)
                  </Label>

                  {/* Show existing thumbnail */}
                  {existingThumbnail && !thumbnailPreview && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Current thumbnail:
                      </p>
                      <div className="relative">
                        <Image
                          width={200}
                          height={150}
                          src={existingThumbnail || "/placeholder.svg"}
                          alt="Current thumbnail"
                          className="max-h-40 w-auto rounded-md object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                      ref={thumbnailInputRef}
                    />
                    {formData.thumbnail && thumbnailPreview ? (
                      <div className="space-y-3">
                        <Image
                          width={100}
                          height={100}
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="New thumbnail preview"
                          className="max-h-40 w-auto mx-auto rounded-md object-contain"
                        />
                        <p
                          className="text-sm text-gray-600 truncate"
                          title={formData.thumbnail.name}
                        >
                          {formData.thumbnail.name}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveThumbnail}
                          className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="mr-2 h-4 w-4" /> Remove New Image
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4"
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {existingThumbnail
                            ? "Click to replace thumbnail"
                            : "Click or drag to upload"}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* File Upload */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>File (PDF, Word, etc.)</Label>

                  {/* Show existing file */}
                  {existingFile && !formData.file && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 mb-1">
                        Current file:
                      </p>
                      <a
                        href={existingFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View current file ({existingFile.type})
                      </a>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.file
                          ? formData.file.name
                          : existingFile
                          ? "Click to replace file"
                          : "Click to upload file"}
                      </p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Multiple Images Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="images-upload">Additional Images</Label>

                  {/* Show existing images */}
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Current images:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {existingImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={imageUrl || "/placeholder.svg"}
                              alt={`Existing image ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveExistingImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesUpload}
                      className="hidden"
                      id="images-upload"
                    />
                    <label
                      htmlFor="images-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click or drag to upload new images
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB each
                      </p>
                    </label>
                  </div>

                  {/* Show new images to be uploaded */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        New images to upload:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((previewUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={previewUrl || "/placeholder.svg"}
                              alt={`New preview ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <p
                              className="text-xs text-gray-500 truncate mt-1"
                              title={formData.images[index]?.name}
                            >
                              {formData.images[index]?.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Resource"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
