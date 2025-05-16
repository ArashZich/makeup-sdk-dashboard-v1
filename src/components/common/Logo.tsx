// src/components/common/Logo.tsx
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center space-x-2 rtl:space-x-reverse",
        className
      )}
    >
      <Image
        src="https://armogroup.storage.iran.liara.space/armo-logo/logo.svg"
        alt="Makeup SDK Dashboard"
        width={64}
        height={64}
        className="h-10 w-10"
      />
    </Link>
  );
}
