"use client"
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

interface AuthFormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  name?: string;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  company?: string;
  setCompany?: React.Dispatch<React.SetStateAction<string>>;
  isLoading?: boolean;
  isSignUp?: boolean;
}

export default function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  name = "",
  setName,
  company = "",
  setCompany,
  isLoading = false,
  isSignUp = false
}: AuthFormProps) {
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setName) setName(e.target.value);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setCompany) setCompany(e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isSignUp && (
        <>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={handleCompanyChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Enter your company name (optional)"
            />
          </div>
        </>
      )}
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Enter your password"
        />
      </div>
      
      {isSignUp && (
        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded"
            />
            <span className="ml-2 text-sm text-gray-400">
              I agree to the{" "}
              <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-dotted underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-dotted underline-offset-2">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>
      )}
    </div>
  );
} 