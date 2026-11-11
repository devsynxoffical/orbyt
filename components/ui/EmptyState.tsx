import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 ring-1 ring-primary-500/20">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-collab-yellow">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
