import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
      <Breadcrumbs items={breadcrumbs} />
      <PageHeader title={title} description={description} actions={actions} />
      <div
        className="mb-6 border border-primary/20 bg-secondary px-4 py-3 text-sm leading-6 text-secondary-foreground"
        role="note"
      >
        {t("common.bloodBankDemoNotice")}
      </div>
      {children}
    </div>
  );
}
