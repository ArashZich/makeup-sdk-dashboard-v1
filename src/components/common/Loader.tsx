// src/components/common/Loader.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
  className?: string;
  variant?: "spinner" | "dots" | "pulse";
}

export function Loader({
  size = "md",
  text,
  fullPage = false,
  className,
  variant = "spinner",
}: LoaderProps) {
  const { t } = useLanguage();

  const loaderText = text ? t(text) : t("common.loading");

  // سایز لودر بر اساس پراپس
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // نوع انیمیشن
  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
              sizeClasses[size]
            )}
          />
        );
      case "dots":
        return (
          <div className="flex space-x-1">
            <motion.div
              className={cn(
                "rounded-full bg-primary",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.5, 1],
                delay: 0,
              }}
            />
            <motion.div
              className={cn(
                "rounded-full bg-primary",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.5, 1],
                delay: 0.2,
              }}
            />
            <motion.div
              className={cn(
                "rounded-full bg-primary",
                size === "sm"
                  ? "h-1 w-1"
                  : size === "md"
                  ? "h-2 w-2"
                  : "h-3 w-3"
              )}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.5, 1],
                delay: 0.4,
              }}
            />
          </div>
        );
      case "pulse":
        return (
          <motion.div
            className={cn("rounded-full bg-primary", sizeClasses[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        );
      default:
        return (
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
              sizeClasses[size]
            )}
          />
        );
    }
  };

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        {renderLoader()}
        {loaderText && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {loaderText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {renderLoader()}
      {loaderText && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {loaderText}
        </p>
      )}
    </div>
  );
}
