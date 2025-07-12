"use client";

import Image from "next/image";
// import Link from "next/link";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import authImg from "@/public/images/loginImage.png";


type FormData = {
  email: string;
  password: string;
};

const validateLogin = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters long",
    },
  },
};

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
 

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Login successful! Welcome back.");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
 const {data:session, status} = useSession()
 console.log(session)
  if(status === "authenticated") router.push("/")

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
  {/* Left: Image (Half Width) */}
  <div className="w-full md:w-1/2 h-1/3 md:h-full">
    <Image
      src={authImg || "/placeholder.svg"}
      width={600}
      height={700}
      alt="Login Illustration"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Right: Form (Half Width) */}
  <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
    <div className="w-full rounded-xl sm:p-8">
      <h2 className="text-2xl font-semibold mb-2">
        Welcome Back!
      </h2>
      <h3 className=" text-[#787878] text-base font-medium mb-10">
        Enter to get unlimited data & information
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email", validateLogin.email)}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email..."
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-1 font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", validateLogin.password)}
              className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password..."
            />
            <button
              type="button"
              className="absolute top-2.5 right-3 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#23547B] hover:bg-[#5e90b9] text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-70"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  </div>
</div>

  );
}
