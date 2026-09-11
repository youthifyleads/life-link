import { useTranslation } from "react-i18next";

import { HospitalPageFrame } from "@/features/hospital/components/hospital-page-frame";
import { RequestForm } from "@/features/hospital/requests/request-form";

export function CreateRequestPage() {
  const { t } = useTranslation();

  return (
    <HospitalPageFrame
      breadcrumbs={[
        { label: t("healthcare.hospital"), href: "/hospital/dashboard" },
        { label: t("nav.bloodRequests"), href: "/hospital/requests" },
        { label: t("hospital.createRequest") },
      ]}
      title={t("hospital.createRequestTitle")}
      description={t("hospital.createRequestDescription")}
    >
      <RequestForm />
    </HospitalPageFrame>
  );
}
