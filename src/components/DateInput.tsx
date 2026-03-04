"use client";
import { useRef, useState, useEffect } from "react";

interface DateInputProps {
  /** ISO date: YYYY-MM-DD */
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  /** className applied to the outer wrapper div (e.g. "flex-1") */
  wrapperClassName?: string;
  id?: string;
  name?: string;
  placeholder?: string;
}

/** Convert YYYY-MM-DD → DD/MM/YYYY for display */
function toDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

/** Convert DD/MM/YYYY → YYYY-MM-DD, returns "" if invalid */
function toISO(display: string): string {
  const parts = display.replace(/\D/g, "/").split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d.length <= 2 && m.length <= 2 && y.length === 4) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return "";
}

/**
 * A date input that always shows DD/MM/YYYY regardless of browser/OS locale.
 * Stores and emits values as YYYY-MM-DD.
 * Click the calendar icon to open the native date picker.
 */
export default function DateInput({
  value,
  onChange,
  className = "",
  wrapperClassName = "",
  id,
  name,
  placeholder = "DD/MM/YYYY",
}: DateInputProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState(toDisplay(value));

  // Sync display when external value changes
  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplay(raw);
    const iso = toISO(raw);
    if (iso) onChange(iso);
  };

  const handleTextBlur = () => {
    // Re-snap display to the last valid value
    setDisplay(toDisplay(value));
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // YYYY-MM-DD
    onChange(iso);
    setDisplay(toDisplay(iso));
  };

  return (
    <div className={`relative flex items-center ${wrapperClassName}`}>
      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        className={`${className} pr-8`}
        value={display}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        inputMode="numeric"
      />
      {/* Calendar trigger button */}
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-2 text-zinc-400 hover:text-zinc-200 leading-none"
        onClick={() => {
          if (nativeRef.current) {
            if ("showPicker" in nativeRef.current) {
              (nativeRef.current as HTMLInputElement & { showPicker: () => void }).showPicker();
            } else {
              (nativeRef.current as HTMLInputElement).click();
            }
          }
        }}
        aria-label="Mở lịch"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
      {/* Hidden native date picker — used only for calendar UI */}
      <input
        ref={nativeRef}
        type="date"
        value={value || ""}
        onChange={handleNativeChange}
        className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
