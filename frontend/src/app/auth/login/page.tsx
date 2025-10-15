"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/providers/AuthProvider";
import AuthForm from "@/components/AuthForm";
import { api } from '@/services/api';
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);

      const response = await login({
        email: email,
        password: password,
      });
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image src="/logo.png" alt="NexaSec Logo" className="h-32" width={100} height={100} />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-8">Log in to access your NexaSec security dashboard</p>

          <form onSubmit={handleSubmit}>
            <AuthForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />

            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-medium py-3 px-4 rounded-md transition-all duration-300 shadow-lg shadow-cyan-500/20 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-400">Don&apos;t have an account?</span>{" "}
              <Link href="/auth/signup" className="text-cyan-400 hover:text-cyan-300">
                Sign up now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}