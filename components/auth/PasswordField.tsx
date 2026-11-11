"use client";

import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

export function PasswordField({
  id,
  label,
  placeholder = "••••••••",
  registration,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-collab-yellow"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className={`input-field pr-10 ${error ? "input-field-error" : ""}`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 hover:text-neutral-600"
          tabIndex={-1}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
