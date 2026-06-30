"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toJalaali, toGregorian, isValidJalaaliDate } from "jalaali-js";

type Props = {
  value: string;
  onChange: (jalaliDate: string) => void;
  placeholder?: string;
};

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toPersianDigits(input: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return input.replace(/\d/g, (d) => persianDigits[Number(d)] ?? d);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function JalaliDatePicker({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayJalali = useMemo(() => {
    const now = new Date();
    return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  const [viewYear, setViewYear] = useState(todayJalali.jy);
  const [viewMonth, setViewMonth] = useState(todayJalali.jm);

  useEffect(() => {
    if (!value) return;
    const match = value.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (match) {
      setViewYear(Number(match[1]));
      setViewMonth(Number(match[2]));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = useMemo(() => {
    if (viewMonth <= 6) return 31;
    if (viewMonth <= 11) return 30;
    const isLeap = (() => {
      const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2132, 2186, 2232, 2245, 2383, 2407, 2419, 2436, 2473, 2637, 3001, 3192, 3307, 3417, 3444, 3499, 3534, 3619, 3679, 3699];
      let jp = breaks[0]!;
      let leap = 0;
      for (let i = 1; i < breaks.length; i++) {
        const jm = breaks[i]!;
        const jump = jm - jp;
        if (viewYear <= jm) {
          leap = jump <= 29 ? 0 : jump === 30 ? 1 : jump === 31 && (viewYear - jp) >= 2 ? 1 : 0;
          break;
        }
        jp = jm;
      }
      return leap === 1;
    })();
    return isLeap ? 30 : 29;
  }, [viewYear, viewMonth]);

  const firstDayWeekday = useMemo(() => {
    const gregorian = toGregorian(viewYear, viewMonth, 1);
    const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    return date.getDay();
  }, [viewYear, viewMonth]);

  function selectDay(day: number) {
    const dateStr = `${viewYear}/${pad2(viewMonth)}/${pad2(day)}`;
    onChange(dateStr);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const selectedDay = useMemo(() => {
    if (!value) return null;
    const match = value.trim().match(/^\d{4}\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) return null;
    const m = Number(match[1]);
    const d = Number(match[2]);
    return m === viewMonth ? d : null;
  }, [value, viewMonth]);

  const isToday = (day: number) =>
    todayJalali.jy === viewYear && todayJalali.jm === viewMonth && todayJalali.jd === day;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value ? toPersianDigits(value) : ""}
        onClick={() => setOpen(!open)}
        placeholder={placeholder}
        readOnly
        className="w-full cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-sm"
      />
      {open && (
        <div className="absolute z-50 mt-1 rounded-xl border border-slate-200 bg-white p-3 shadow-lg" style={{ minWidth: "280px" }}>
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="rounded-lg px-2 py-1 text-sm hover:bg-slate-100">&lt;</button>
            <span className="text-sm font-semibold">{toPersianDigits(String(viewYear))} {PERSIAN_MONTHS[viewMonth - 1]}</span>
            <button type="button" onClick={nextMonth} className="rounded-lg px-2 py-1 text-sm hover:bg-slate-100">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {PERSIAN_WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1 text-xs font-semibold text-slate-500">{wd}</div>
            ))}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`rounded-lg py-1.5 text-sm transition ${
                    isSelected
                      ? "bg-cyan-600 text-white"
                      : today
                        ? "bg-cyan-50 font-bold text-cyan-700 hover:bg-cyan-100"
                        : "hover:bg-slate-100"
                  }`}
                >
                  {toPersianDigits(String(day))}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
