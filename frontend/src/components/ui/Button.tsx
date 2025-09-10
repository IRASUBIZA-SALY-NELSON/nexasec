"use client"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ButtonProps } from "@/types";

export default function Button({ children, pathname, className, onClick }: ButtonProps) {
  const router = useRouter();
  
  if (pathname) {
    return (
      <Link href={pathname} className={className}>
        {children}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className={`${className} px-4 py-2 `}>
      {children}
    </button>
  );
}

