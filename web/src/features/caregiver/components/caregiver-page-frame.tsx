import type { PropsWithChildren, ReactNode } from "react";

import { PageHeader } from "@/shared/components/layout/page-header";
import { Breadcrumbs } from "@/shared/components/navigation/breadcrumbs";

interface CaregiverPageFrameProps extends PropsWithChildren {
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function CaregiverPageFrame({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: CaregiverPageFrameProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5">
        <PageHeader title={title} description={description} actions={actions} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
