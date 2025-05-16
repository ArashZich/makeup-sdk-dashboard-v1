// src/api/types/payments.types.ts
import { PaginatedResponse } from "@/types/common.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";

// نوع وضعیت پرداخت
export type PaymentStatus = "pending" | "success" | "failed" | "canceled";

// مدل پرداخت
export interface Payment {
  _id: string;
  userId: string | User;
  planId: string | Plan;
  amount: number;
  originalAmount?: number;
  couponId?: string;
  clientRefId?: string;
  paymentCode?: string;
  paymentRefId?: string;
  cardNumber?: string;
  cardHashPan?: string;
  payedDate?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی پرداخت‌ها
export interface PaymentFilters {
  userId?: string;
  planId?: string;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد پرداخت
export interface CreatePaymentRequest {
  planId: string;
  couponCode?: string;
}

// مدل پاسخ ایجاد پرداخت
export interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl: string;
  amount: number;
  discount?: number;
  finalAmount: number;
}

// تایپ پاسخ صفحه‌بندی شده پرداخت‌ها
export type PaginatedPayments = PaginatedResponse<Payment>;
