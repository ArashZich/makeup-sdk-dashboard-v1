// src/components/ui/switch.tsx - ساده‌ترین روش
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  dir?: "ltr" | "rtl";
}

function Switch({ className, dir = "ltr", ...props }: SwitchProps) {
  const isRTL = dir === "rtl";

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      dir={dir} // ✅ تنظیم direction برای Radix
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        // ✅ اضافه کردن RTL class conditionally
        isRTL && "rtl",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          // ✅ کلاس‌های متفاوت برای RTL/LTR
          isRTL
            ? "rtl:data-[state=checked]:-translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
            : "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
