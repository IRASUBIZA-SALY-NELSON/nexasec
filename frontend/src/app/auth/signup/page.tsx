"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import AuthForm from "@/components/AuthForm";
import PlanSelector from "@/components/PlanSelector";
import { useAuthContext } from "@/providers/AuthProvider";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Step 1: Plan selection, Step 2: Registration form
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!selectedPlan) {
        toast.error("Please select a subscription plan to continue");
        return;
      }
      
      setStep(2);
      return;
    }
    
    if (!email || !password || !name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, you would send the selectedPlan to your backend
      await signup(email, password, name, company, selectedPlan);
      
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-12">
      <div className="max-w-4xl w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <img src="/logo.png" alt="NexaSec Logo" className="h-32" />
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-white mb-8">
            {step === 1 ? "Choose Your NexaSec Plan" : "Create Your Account"}
          </h1>
          
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <PlanSelector 
                  selectedPlan={selectedPlan} 
                  onSelectPlan={setSelectedPlan} 
                />
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    disabled={isLoading}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 p-3 bg-cyan-900/20 border border-cyan-800/60 rounded-lg">
                  <p className="text-sm text-cyan-300">
                    You selected the <strong>{selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : ''}</strong> plan. 
                    <button 
                      type="button" 
                      className="text-cyan-400 underline ml-1"
                      onClick={() => setStep(1)}
                    >
                      Change plan
                    </button>
                  </p>
                </div>
                
                <AuthForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  name={name}
                  setName={setName}
                  company={company}
                  setCompany={setCompany}
                  isLoading={isLoading}
                  isSignUp
                />
                
                <div className="mt-8 flex justify-between items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={() => setStep(1)}
                  >
                    ← Back to Plans
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 