import type { ReactNode } from "react";

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
  return (
    <div className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6 sm:py-8">
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
