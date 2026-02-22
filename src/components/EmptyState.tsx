import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, primaryCTA, secondaryCTA }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-12 text-center">
      {icon && <span className="mb-3 text-4xl">{icon}</span>}
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-400">{description}</p>
      )}
      {(primaryCTA || secondaryCTA) && (
        <div className="mt-4 flex items-center gap-3">
          {primaryCTA && (
            <Link
              href={primaryCTA.href}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              {primaryCTA.label}
            </Link>
          )}
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {secondaryCTA.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
