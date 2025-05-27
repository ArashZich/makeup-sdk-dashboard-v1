"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";

export interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: "single" | "range";
  selected?: Date | [Date | null, Date | null] | null;
  onSelect?: (date: Date | [Date | null, Date | null] | null) => void;
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  locale?: string;
  dir?: "ltr" | "rtl";
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  disabled,
  fromDate,
  toDate,
  locale = "en",
  dir = "ltr",
  ...props
}: CalendarProps) {
  const isRangeMode = mode === "range";

  const handleDateChange = (date: Date | [Date | null, Date | null] | null) => {
    if (onSelect) {
      onSelect(date);
    }
  };

  const customHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: any) => (
    <div className="flex justify-between items-center px-2 py-2">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="text-sm font-medium">
        {date.toLocaleDateString(locale, { month: "long", year: "numeric" })}
      </span>

      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );

  // پیکربندی مشترک
  const baseProps = {
    onChange: handleDateChange,
    inline: true,
    renderCustomHeader: customHeader,
    filterDate: disabled ? (date: Date) => !disabled(date) : undefined,
    minDate: fromDate,
    maxDate: toDate,
    locale: locale,
    calendarClassName: cn(
      "border-none shadow-none bg-transparent",
      "text-sm",
      "[&_.react-datepicker__day]:size-8 [&_.react-datepicker__day]:leading-8",
      "[&_.react-datepicker__day]:rounded-md [&_.react-datepicker__day]:border-0",
      "[&_.react-datepicker__day:hover]:bg-accent",
      "[&_.react-datepicker__day--selected]:bg-primary [&_.react-datepicker__day--selected]:text-primary-foreground",
      "[&_.react-datepicker__day--today]:bg-accent [&_.react-datepicker__day--today]:text-accent-foreground",
      "[&_.react-datepicker__day--outside-month]:text-muted-foreground [&_.react-datepicker__day--outside-month]:opacity-50",
      "[&_.react-datepicker__day--disabled]:text-muted-foreground [&_.react-datepicker__day--disabled]:opacity-50",
      "[&_.react-datepicker__day--in-range]:bg-accent [&_.react-datepicker__day--in-range]:text-accent-foreground",
      "[&_.react-datepicker__day--range-start]:bg-primary [&_.react-datepicker__day--range-start]:text-primary-foreground",
      "[&_.react-datepicker__day--range-end]:bg-primary [&_.react-datepicker__day--range-end]:text-primary-foreground",
      "[&_.react-datepicker__header]:bg-transparent [&_.react-datepicker__header]:border-none",
      "[&_.react-datepicker__day-names]:mb-1",
      "[&_.react-datepicker__day-name]:text-muted-foreground [&_.react-datepicker__day-name]:text-xs [&_.react-datepicker__day-name]:font-normal [&_.react-datepicker__day-name]:size-8",
      "[&_.react-datepicker__week]:gap-0",
      classNames?.root
    ),
    dayClassName: (date: Date) =>
      cn(
        "text-center cursor-pointer transition-colors",
        date.getDate() === new Date().getDate() &&
          date.getMonth() === new Date().getMonth() &&
          date.getFullYear() === new Date().getFullYear()
          ? "bg-accent text-accent-foreground"
          : ""
      ),
    ...props,
  };

  return (
    <div className={cn("p-3", className)} dir={dir}>
      {isRangeMode ? (
        <DatePicker
          {...baseProps}
          selectsRange
          startDate={Array.isArray(selected) ? selected[0] : undefined}
          endDate={Array.isArray(selected) ? selected[1] : undefined}
        />
      ) : (
        <DatePicker {...baseProps} selected={selected as Date | null} />
      )}
    </div>
  );
}

export { Calendar };
