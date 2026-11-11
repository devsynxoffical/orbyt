"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUser } from "@/lib/actions/admin-account";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
});

type FormData = z.infer<typeof schema>;

export function UserCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const result = await createUser(data.name, data.email);
      setTempPassword(result.tempPassword);
      setCreatedEmail(data.email);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    }
  };

  const closeAll = () => {
    setOpen(false);
    setTempPassword(null);
    setCreatedEmail(null);
    setError(null);
    reset();
  };

  if (tempPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
          <h3 className="text-lg font-bold text-collab-yellow">User created</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Share these login credentials with{" "}
            <span className="font-semibold">{createdEmail}</span>. They can change
            their password after signing in.
          </p>
          <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
              Temporary password
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-collab-yellow">
              {tempPassword}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAll}
            className="btn-primary mt-6 w-full"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        Create user
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-collab-yellow">Create user</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Admin creates all accounts. A temporary password is generated
              automatically.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-collab-yellow">
                  Full name
                </label>
                <input className="input-field" {...register("name")} />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-collab-yellow">
                  Email
                </label>
                <input type="email" className="input-field" {...register("email")} />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {error && (
                <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAll}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
