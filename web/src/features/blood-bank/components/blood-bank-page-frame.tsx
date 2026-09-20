import type { ReactNode } from "react";

import { PageHeader } from "@/shared/components/layout/page-header";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/shared/components/navigation/breadcrumbs";

interface BloodBankPageFrameProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function BloodBankPageFrame({
  breadcrumbs,
  title,
  description,
  actions,
  children,
}: BloodBankPageFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5">
        <PageHeader title={title} description={description} actions={actions} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
