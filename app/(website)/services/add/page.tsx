"use client";

import type React from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, FileText, ImageIcon, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border border-gray-300 rounded-md flex items-center justify-center">
      Loading editor...
    </div>
  ),
});

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

export default function ResourceForm() {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
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
  // const { data: session } = useSession();
  // const API_TOKEN = session?.user?.accessToken;

  const session = useSession();
  const API_TOKEN = session?.data?.accessToken || "";

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
  ];

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
    });

  const { mutate: submitResource, isPending: isSubmitting } = useMutation({
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

      const response = await fetch(`${API_BASE_URL}/api/v1/resource`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to publish resource: ${
            errorData.message || response.statusText
          }`
        );
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Resource published successfully:", data);
      toast({
        title: "Success!",
        description: "Resource has been published successfully.",
        variant: "default",
      });

      setTimeout(() => {
        // Reset form data after successful submission
        setFormData({
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
        setSelectedCountry(null);
        setSelectedStates([]);
        setThumbnailPreview(null);
        setImagePreviews([]);
      }, 1000);

      // window.location.reload();
    },
    onError: (error: Error) => {
      console.error("Error publishing resource:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to publish resource. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSelectedStates([]);
    setFormData((prev) => ({
      ...prev,
      country: country.countryName,
      states: [],
    }));
    setCountryOpen(false);
  };

  const handleStateToggle = (state: string) => {
    const newStates = selectedStates.includes(state)
      ? selectedStates.filter((s) => s !== state)
      : [...selectedStates, state];
    setSelectedStates(newStates);
    setFormData((prev) => ({ ...prev, states: newStates }));
  };

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
    setFormData((prev) => ({ ...prev, thumbnail: null }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file: uploadedFile,
    }));
  };

  const handleImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const currentImageCount = formData.images.length;
      const maxImages = 4;
      const remainingSlots = maxImages - currentImageCount;

      // If already at limit, prevent any new uploads
      if (remainingSlots <= 0) {
        toast({
          title: "Image limit reached",
          description: "You can only upload a maximum of 4 images.",
          variant: "destructive",
        });
        if (event.target) {
          event.target.value = "";
        }
        return;
      }

      // Filter out non-image files
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

      // Limit to remaining slots
      const filesToAdd = imageFiles.slice(0, remainingSlots);

      if (filesToAdd.length < imageFiles.length) {
        toast({
          title: "Image limit reached",
          description: `Only ${filesToAdd.length} image(s) were added. Maximum of 4 images allowed.`,
          variant: "destructive",
        });
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...filesToAdd],
      }));
      setImagePreviews((prev) => [
        ...prev,
        ...filesToAdd.map((file) => URL.createObjectURL(file)),
      ]);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = () => {
    const practiceAreaObj = practiceAreasData?.find(
      (p) => p._id === formData.practiceArea
    );
    const resourceTypeObj = resourceTypesData?.find(
      (rt) => rt._id === formData.resourceType
    );

    const dataToLog = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      discountPrice: formData.discountPrice,
      format: formData.format,
      quantity: formData.quantity,
      country: formData.country,
      states: formData.states,
      practiceAreas: practiceAreaObj
        ? [practiceAreaObj.name]
        : formData.practiceArea
        ? [formData.practiceArea]
        : [],
      resourceType: resourceTypeObj
        ? [resourceTypeObj.resourceTypeName]
        : formData.resourceType
        ? [formData.resourceType]
        : [],
      thumbnail: formData.thumbnail
        ? `https://res.cloudinary.com/dyxwchbmh/image/upload/v_placeholder/resources/thumbnails/thumb_${formData.thumbnail.name}`
        : null,
      file: formData.file
        ? {
            url: `https://res.cloudinary.com/dyxwchbmh/image/upload/v_placeholder/resources/files/doc_${formData.file.name}`,
            type: formData.file.type,
          }
        : null,
      images: formData.images.map(
        (img) =>
          `https://res.cloudinary.com/dyxwchbmh/image/upload/v_placeholder/resources/images/img_${img.name}`
      ),
    };
    console.log("Form Data (for logging):", dataToLog);
    submitResource(formData);
  };

  const filteredStates =
    selectedCountry?.states.filter((state) =>
      state.toLowerCase().includes(stateSearch.toLowerCase())
    ) || [];

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [thumbnailPreview, imagePreviews]);

  return (
    <div>
      <div className="mt-6 px-6">
        <PageHeader title="Resource List" />
        <p className="text-gray-500 -mt-4">Dashboard &gt; Resource List</p>
      </div>

      <div className="max-w-9xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Add Resource
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Add Title
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
                    {isClient && (
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
                          alt="Thumbnail preview"
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
                          <X className="mr-2 h-4 w-4" /> Remove Image
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4"
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click or drag to upload
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
                <CardTitle>Upload Images</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="images-upload">
                    Additional Images ({formData.images.length}/4 maximum)
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center",
                      formData.images.length >= 4
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-300"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesUpload}
                      className="hidden"
                      id="images-upload"
                      disabled={formData.images.length >= 4}
                    />
                    <label
                      htmlFor="images-upload"
                      className={cn(
                        "flex flex-col items-center justify-center space-y-2 py-4",
                        formData.images.length >= 4
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      )}
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {formData.images.length >= 4
                          ? "Maximum 4 images reached"
                          : "Click or drag to upload images"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.images.length >= 4
                          ? "Remove an image to add more"
                          : "PNG, JPG, GIF up to 5MB each (Max 4 images)"}
                      </p>
                    </label>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={previewUrl || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
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
              {isSubmitting ? "Publishing..." : "Publish Resources"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
