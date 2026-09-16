import type { PropsWithChildren, ReactNode } from "react";

import { PageHeader } from "@/shared/components/layout/page-header";
import { Breadcrumbs } from "@/shared/components/navigation/breadcrumbs";

interface AdminPageFrameProps extends PropsWithChildren {
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function AdminPageFrame({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: AdminPageFrameProps) {
  return (
    <div className="mx-auto max-w-[105rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5">
        <PageHeader title={title} description={description} actions={actions} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
