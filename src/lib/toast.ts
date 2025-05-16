// src/lib/toast.ts
import toast, { ToastOptions } from "react-hot-toast";

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: "bottom-center",
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...defaultOptions, ...options });
  },
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  },
  custom: (message: string, options?: ToastOptions) => {
    return toast(message, { ...defaultOptions, ...options });
  },
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
