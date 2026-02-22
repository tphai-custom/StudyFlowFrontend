import { ReactNode } from "react";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-zinc-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-zinc-700">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-zinc-300 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-zinc-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-zinc-100">{title}</h1>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
