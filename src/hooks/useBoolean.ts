// src/hooks/useBoolean.ts
import { useState, useCallback } from "react";

type BooleanId = string;

export function useBoolean(initialState: Record<BooleanId, boolean> = {}) {
  const [values, setValues] =
    useState<Record<BooleanId, boolean>>(initialState);

  // تغییر وضعیت به true
  const setTrue = useCallback((id: BooleanId) => {
    setValues((prev) => ({ ...prev, [id]: true }));
  }, []);

  // تغییر وضعیت به false
  const setFalse = useCallback((id: BooleanId) => {
    setValues((prev) => ({ ...prev, [id]: false }));
  }, []);

  // تغییر وضعیت (toggle)
  const toggle = useCallback((id: BooleanId) => {
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // تنظیم وضعیت به مقدار دلخواه
  const setValue = useCallback((id: BooleanId, value: boolean) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  // بررسی وضعیت
  const getValue = useCallback(
    (id: BooleanId) => values[id] ?? false,
    [values]
  );

  return {
    values,
    setTrue,
    setFalse,
    toggle,
    setValue,
    getValue,
  };
}

// How to use
// import { useBoolean } from "@/hooks/useBoolean";

// // در کامپوننت شما
// const { getValue, toggle, setTrue, setFalse } = useBoolean({
//   showToken: false,
//   showMenu: false,
//   isExpanded: true
// });

// // در رویداد‌ها
// const handleToggleToken = () => {
//   toggle("showToken");
// };

// // در رندر
// return (
//   <div>
//     <Button onClick={handleToggleToken}>
//       {getValue("showToken") ? "مخفی کردن توکن" : "نمایش توکن"}
//     </Button>

//     {getValue("showToken") && (
//       <div>توکن: {token}</div>
//     )}

//     <Button onClick={() => setTrue("showMenu")}>نمایش منو</Button>
//     <Button onClick={() => setFalse("showMenu")}>بستن منو</Button>
//   </div>
// );
