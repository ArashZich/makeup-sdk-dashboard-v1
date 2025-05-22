// src/lib/numberConverter.ts

/**
 * تبدیل اعداد فارسی به انگلیسی
 * @param input - رشته‌ای که ممکن است شامل اعداد فارسی باشد
 * @returns رشته با اعداد انگلیسی
 */
export function convertPersianToEnglishNumbers(input: string): string {
  if (!input) return input;

  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = input;

  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(
      new RegExp(persianNumbers[i], "g"),
      englishNumbers[i]
    );
  }

  return result;
}

/**
 * تبدیل اعداد انگلیسی به فارسی
 * @param input - رشته‌ای که شامل اعداد انگلیسی است
 * @returns رشته با اعداد فارسی
 */
export function convertEnglishToPersianNumbers(input: string | number): string {
  if (!input && input !== 0) return "";

  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  let result = input.toString();

  for (let i = 0; i < englishNumbers.length; i++) {
    result = result.replace(
      new RegExp(englishNumbers[i], "g"),
      persianNumbers[i]
    );
  }

  return result;
}

/**
 * تمیز کردن شماره تلفن (حذف کاراکترهای غیرضروری و تبدیل اعداد فارسی)
 * @param phoneNumber - شماره تلفن ورودی
 * @returns شماره تلفن تمیز شده
 */
export function cleanPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";

  // تبدیل اعداد فارسی به انگلیسی
  let cleaned = convertPersianToEnglishNumbers(phoneNumber);

  // حذف تمام کاراکترهای غیرعددی
  cleaned = cleaned.replace(/\D/g, "");

  // اگر با 0 شروع نمی‌شود و 10 رقمی است، 0 را به ابتدا اضافه کن
  if (cleaned.length === 10 && !cleaned.startsWith("0")) {
    cleaned = "0" + cleaned;
  }

  // اگر با 98 شروع می‌شود، آن را به 0 تبدیل کن
  if (cleaned.startsWith("98") && cleaned.length === 12) {
    cleaned = "0" + cleaned.substring(2);
  }

  return cleaned;
}

/**
 * تمیز کردن کد OTP (حذف کاراکترهای غیرضروری و تبدیل اعداد فارسی)
 * @param otpCode - کد OTP ورودی
 * @returns کد OTP تمیز شده
 */
export function cleanOtpCode(otpCode: string): string {
  if (!otpCode) return "";

  // تبدیل اعداد فارسی به انگلیسی
  let cleaned = convertPersianToEnglishNumbers(otpCode);

  // حذف تمام کاراکترهای غیرعددی
  cleaned = cleaned.replace(/\D/g, "");

  return cleaned;
}

/**
 * فرمت کردن شماره تلفن برای نمایش
 * @param phoneNumber - شماره تلفن
 * @param usePersianNumbers - آیا از اعداد فارسی استفاده شود
 * @returns شماره تلفن فرمت شده
 */
export function formatPhoneNumber(
  phoneNumber: string,
  usePersianNumbers: boolean = false
): string {
  if (!phoneNumber) return "";

  const cleaned = cleanPhoneNumber(phoneNumber);

  // فرمت: 0912 345 6789
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    const formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(
      4,
      7
    )} ${cleaned.substring(7)}`;
    return usePersianNumbers
      ? convertEnglishToPersianNumbers(formatted)
      : formatted;
  }

  return usePersianNumbers ? convertEnglishToPersianNumbers(cleaned) : cleaned;
}

/**
 * اعتبارسنجی شماره تلفن ایرانی
 * @param phoneNumber - شماره تلفن
 * @returns آیا شماره تلفن معتبر است
 */
export function validateIranianPhoneNumber(phoneNumber: string): boolean {
  const cleaned = cleanPhoneNumber(phoneNumber);

  // شماره تلفن ایرانی باید 11 رقمی باشد و با 09 شروع شود
  const iranianPhoneRegex = /^09[0-9]{9}$/;

  return iranianPhoneRegex.test(cleaned);
}

/**
 * اعتبارسنجی کد OTP
 * @param otpCode - کد OTP
 * @param length - طول مورد انتظار کد (پیش‌فرض: 4-6 رقم)
 * @returns آیا کد OTP معتبر است
 */
export function validateOtpCode(
  otpCode: string,
  minLength: number = 4,
  maxLength: number = 6
): boolean {
  const cleaned = cleanOtpCode(otpCode);

  return (
    cleaned.length >= minLength &&
    cleaned.length <= maxLength &&
    /^\d+$/.test(cleaned)
  );
}
