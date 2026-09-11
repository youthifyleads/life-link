import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/shared/components/layout/page-header";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/shared/components/navigation/breadcrumbs";

interface HospitalPageFrameProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  context?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function HospitalPageFrame({
  breadcrumbs,
  title,
  description,
  context,
  actions,
  children,
}: HospitalPageFrameProps) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-start gap-2 border border-primary/20 bg-secondary px-3 py-2 text-xs leading-5 text-secondary-foreground">
        <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          {t("common.hospitalDemoNotice")}
        </p>
      </div>
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5">
        <PageHeader
          title={title}
          description={description}
          context={context}
          actions={actions}
        />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
