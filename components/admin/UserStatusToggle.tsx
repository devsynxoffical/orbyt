"use client";

import { useRouter } from "next/navigation";
import { UserStatus } from "@prisma/client";
import { setUserStatus } from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { isDemoAccountEmail } from "@/lib/demo-accounts";

type UserStatusToggleProps = {
  userId: string;
  status: UserStatus;
  email: string;
};

export function UserStatusToggle({
  userId,
  status,
  email,
}: UserStatusToggleProps) {
  const router = useRouter();
  const isDemo = isDemoAccountEmail(email);

  if (isDemo) {
    return (
      <span className="text-xs text-neutral-400" title="Demo accounts stay active">
        Demo account
      </span>
    );
  }

  const run = async (next: UserStatus) => {
    await setUserStatus(userId, next);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "ACTIVE" && (
        <ConfirmDialog
          title="Unblock user?"
          message="They will be able to sign in again. Failed-login counter will be reset."
          confirmLabel="Unblock"
          variant="primary"
          onConfirm={() => run("ACTIVE")}
          trigger={
            <button
              type="button"
              className="text-xs font-medium text-accent-600 hover:text-accent-600/80"
            >
              Unblock
            </button>
          }
        />
      )}

      {status === "ACTIVE" && (
        <>
          <ConfirmDialog
            title="Suspend user?"
            message="They lose dashboard access until you unblock them."
            confirmLabel="Suspend"
            variant="danger"
            onConfirm={() => run("SUSPENDED")}
            trigger={
              <button
                type="button"
                className="text-xs font-medium text-danger-500 hover:text-danger-500/80"
              >
                Suspend
              </button>
            }
          />
          <ConfirmDialog
            title="Block user?"
            message="Same as a lockout — they must contact admin to sign in again."
            confirmLabel="Block"
            variant="danger"
            onConfirm={() => run("LOCKED")}
            trigger={
              <button
                type="button"
                className="text-xs font-medium text-warning-600 hover:text-warning-600/80"
              >
                Block
              </button>
            }
          />
        </>
      )}

      {status === "SUSPENDED" && (
        <ConfirmDialog
          title="Block instead?"
          message="Mark as locked (failed-login style). They still cannot sign in until unblocked."
          confirmLabel="Block"
          variant="danger"
          onConfirm={() => run("LOCKED")}
          trigger={
            <button
              type="button"
              className="text-xs font-medium text-warning-600 hover:text-warning-600/80"
            >
              Block
            </button>
          }
        />
      )}

      {status === "LOCKED" && (
        <ConfirmDialog
          title="Suspend instead?"
          message="Keep them out as a suspended account (admin policy)."
          confirmLabel="Suspend"
          variant="danger"
          onConfirm={() => run("SUSPENDED")}
          trigger={
            <button
              type="button"
              className="text-xs font-medium text-danger-500 hover:text-danger-500/80"
            >
              Suspend
            </button>
          }
        />
      )}
    </div>
  );
}
