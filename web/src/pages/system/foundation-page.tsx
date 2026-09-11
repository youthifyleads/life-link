import { useTranslation } from "react-i18next";

import { Breadcrumbs } from "@/shared/components/navigation/breadcrumbs";
import { PageHeader } from "@/shared/components/layout/page-header";
import { EmptyState } from "@/shared/components/feedback/system-states";

export function FoundationPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={[{ label: t("system.workspace") }]} />
      <div className="mt-5">
        <PageHeader
          title={t("foundation.title")}
          description={t("foundation.description")}
        />
      </div>
      <div className="mt-8">
        <EmptyState
          title={t("system.noModuleTitle")}
          description={t("system.noModuleDescription")}
        />
      </div>
    </div>
  );
}
