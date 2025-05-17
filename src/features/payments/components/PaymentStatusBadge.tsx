"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentStatus } from "@/api/types/payments.types";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MinusCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
  showIcon?: boolean;
}

export function PaymentStatusBadge({
  status,
  className,
  showIcon = true,
}: PaymentStatusBadgeProps) {
  const { t } = useLanguage();

  const statusConfig = {
    pending: {
      label: t("payments.status.pending"),
      variant: "secondary" as const,
      icon: ClockIcon,
    },
    success: {
      label: t("payments.status.success"),
      variant: "default" as const,
      icon: CheckCircleIcon,
    },
    failed: {
      label: t("payments.status.failed"),
      variant: "destructive" as const,
      icon: XCircleIcon,
    },
    canceled: {
      label: t("payments.status.canceled"),
      variant: "outline" as const,
      icon: MinusCircleIcon,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "text-xs font-normal py-1 px-2 gap-1.5",
        {
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-100":
            status === "pending",
          "bg-green-100 text-green-800 hover:bg-green-100":
            status === "success",
          "bg-red-100 text-red-800 hover:bg-red-100": status === "failed",
          "bg-gray-100 text-gray-800 hover:bg-gray-100": status === "canceled",
        },
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}
