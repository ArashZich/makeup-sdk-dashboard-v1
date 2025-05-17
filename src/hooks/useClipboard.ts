// src/hooks/useClipboard.ts
import { useState, useCallback } from "react";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeout = options.timeout || 2000;
  const successMessage = options.successMessage || t("common.copied");
  const errorMessage = options.errorMessage || t("common.copyFailed");

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setError(null);

        if (successMessage) {
          showToast.success(successMessage);
        }

        // Reset after timeout
        setTimeout(() => {
          setIsCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        setError(errorMessage);
        setIsCopied(false);

        if (errorMessage) {
          showToast.error(errorMessage);
        }

        return false;
      }
    },
    [successMessage, errorMessage, timeout]
  );

  return {
    isCopied,
    error,
    copyToClipboard,
  };
}

// How to use
// import { useClipboard } from "@/hooks/useClipboard";

// // در کامپوننت شما
// const { isCopied, copyToClipboard } = useClipboard({
//   successMessage: "توکن با موفقیت کپی شد!",
//   errorMessage: "خطا در کپی توکن",
//   timeout: 3000 // مدت زمان نمایش وضعیت کپی (میلی‌ثانیه)
// });

// // در رویداد کلیک
// const handleCopy = () => {
//   copyToClipboard(token);
// };

// // در رندر
// return (
//   <Button onClick={handleCopy}>
//     {isCopied ? <Check /> : <Copy />}
//     {isCopied ? "کپی شد" : "کپی کردن"}
//   </Button>
// );
