"use client"
import Link from "next/link";
import { ButtonProps } from "@/types/index";

export default function Button({ children, pathname, className, onClick }: ButtonProps) {

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
