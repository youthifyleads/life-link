import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("nav.breadcrumb")} className="overflow-x-auto" tabIndex={0}>
      <ol className="flex min-w-max items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="mx-1 size-4 shrink-0 rtl:rotate-180"
                />
              ) : null}
              {item.href && !current ? (
                <Link
                  to={item.href}
                  className="rounded-sm font-medium hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={
                    current ? "font-semibold text-foreground" : undefined
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
