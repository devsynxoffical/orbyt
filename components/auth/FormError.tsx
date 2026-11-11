"use client";

type FormErrorProps = {
  message?: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
      {message}
    </p>
  );
}
