"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <div className="flex h-screen bg-[#EDEEF1]">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Change Password
            </h1>
            <p className="text-gray-500">
              Dashboard &gt; Setting &gt; Change Password
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-4 mb-8">
              <Avatar className="h-[120px] w-[120px]">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Mr. Raja
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* Password fields in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="mt-3 border border-[#707070] h-[60px]"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="mt-3 border border-[#707070] h-[60px]"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="mt-3 border border-[#707070] h-[60px]"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
