import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  Phone,
  QrCode,
  ThermometerSnowflake,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import type { HospitalRequest } from "@/features/hospital/types/hospital.types";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface HospitalDeliveryTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HospitalRequest;
  onOpenQr?: () => void;
}

export function HospitalDeliveryTrackingDialog({
  open,
  onOpenChange,
  request,
  onOpenQr,
}: HospitalDeliveryTrackingDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const isCompleted = request.status === "completed";

  // Clean, human-readable requisition & tracking code (avoids raw JWT string overflow)
  const rawId = request.id.replace("REQ-", "").replace("BR-", "").replace("#", "");
  const displayTrackingCode =
    request.id.startsWith("REQ-") || request.id.startsWith("BR-")
      ? request.id
      : `REQ-${rawId.slice(0, 8).toUpperCase()}`;

  const copyPayload = request.trackingReference || displayTrackingCode;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(copyPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const waypoints = [
    {
      title: t("hospital.wp1Title", "اعتماد وتجهيز أكياس الدم"),
      location: request.targetBloodBank?.name || "بنك الدم المركزي",
      time: formatDateTime(request.createdAt),
      status: "done",
      detail: t("hospital.wp1Detail", "تم فحص واختبار التوافق السريري وصرف الوحدات"),
    },
    {
      title: t("hospital.wp2Title", "فحص سلسلة التبريد وختم الصندوق"),
      location: t("hospital.wp2Loc", "معمل الصرف والتجهيز"),
      time: formatDateTime(request.updatedAt || request.createdAt),
      status: "done",
      detail: t("hospital.wp2Detail", "تم إغلاق الصندوق المبرد برقم قفل SEAL-889 ودرجة حرارة 3.8°C"),
    },
    {
      title: t("hospital.wp3Title", "في الطريق عبر سيارة النقل المجهزة"),
      location: t("hospital.wp3Loc", "مسار الإمداد السريع — كوبري قصر العيني"),
      time: isCompleted ? formatDateTime(request.requiredAt) : t("hospital.now", "الآن"),
      status: isCompleted ? "done" : "current",
      detail: t("hospital.wp3Detail", "سيارة نقل طبي مجهزة (ق هـ د ٩٤١٢) — كابتن محمود عزت"),
    },
    {
      title: t("hospital.wp4Title", "الوصول والتسليم لقسم الطوارئ"),
      location: t("hospital.wp4Loc", "مستشفى قصر العيني الفرنساوي — العناية المركزة"),
      time: isCompleted ? formatDateTime(request.requiredAt) : t("hospital.estimatedArrival", "الموعد المتوقع للتسليم"),
      status: isCompleted ? "done" : "pending",
      detail: isCompleted
        ? t("hospital.wp4Delivered", "تم فحص درجة الحرارة عند الاستلام (4.0°C) والتسليم لطاقم التمريض")
        : t("hospital.wp4Pending", "بانتظار وصول سيارة الإمداد وتأكيد الاستلام"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7">
        <DialogHeader className="border-b border-border pb-4 text-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground sm:text-lg">
                  {t("hospital.trackingDialogTitle", "تتبع مسار الشحنة وسلسلة التبريد")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("hospital.trackingDialogSubtitle", "متابعة خط سير سيارة الإمداد ودرجات الحرارة لحظياً")}
                </DialogDescription>
              </div>
            </div>
            <RequestStatusBadge status={request.status} />
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2 text-xs">
          {/* Cold Chain & Courier Card */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
            {/* Courier Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Truck className="size-4" />
                <span>{t("hospital.courierTitle", "بيانات سيارة الإمداد الطبي:")}</span>
              </div>
              <p className="font-bold text-foreground text-sm">
                كابتن محمود عزت (لوجستيات قصر العيني)
              </p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>سيارة مجهزة: ق هـ د ٩٤١٢</span>
                <span>•</span>
                <a
                  href="tel:+201098765432"
                  className="flex items-center gap-1 text-primary hover:underline font-mono"
                  dir="ltr"
                >
                  <Phone className="size-3" />
                  +20 10 9876 5432
                </a>
              </div>
            </div>

            {/* Cold Chain Sensor */}
            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-s border-border sm:ps-4 pt-2 sm:pt-0">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <ThermometerSnowflake className="size-4" />
                  <span>{t("hospital.coldChainSensors", "حساسات التبريد:")}</span>
                </span>
                <span className="font-mono font-bold text-success text-sm bg-success-subtle px-2 py-0.5 rounded border border-success/30">
                  3.8°C
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                درجة حرارة الصندوق آمنة ومطابقة للمعايير السريرية (2°C - 6°C). القفل: <code className="font-mono text-foreground font-semibold">SEAL-889</code>.
              </p>
            </div>
          </div>

          {/* Blood Order Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-surface p-3 sm:p-3.5 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <BloodGroupBadge group={request.bloodGroup} />
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-xs block">
                  {request.quantity} {request.quantity === 1 ? "كيس دم" : "أكياس دم"}
                </span>
                <span
                  className="text-[11px] text-muted-foreground truncate block max-w-[200px] sm:max-w-xs"
                  title={request.reason}
                >
                  {request.reason || "طلب نقل دم سريري"}
                </span>
              </div>
            </div>
            <div className="text-end shrink-0 ms-auto">
              <span className="text-[10px] text-muted-foreground block">
                {t("hospital.trackingCode", "كود التتبع:")}
              </span>
              <div className="mt-0.5 flex items-center gap-1.5 justify-end">
                <span
                  className="font-mono font-bold text-foreground text-xs bg-muted/70 px-2 py-0.5 rounded border border-border select-all"
                  dir="ltr"
                >
                  {displayTrackingCode}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyCode()}
                  className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  title={t("common.copy", "نسخ كود التتبع")}
                  aria-label={t("common.copy", "نسخ كود التتبع")}
                >
                  {copied ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>{t("hospital.waypointsTitle", "محطات مسار النقل والتسليم:")}</span>
            </h4>

            <div className="space-y-4 border border-border bg-surface p-4 rounded-lg">
              {waypoints.map((wp, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Step Marker */}
                  <div
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      wp.status === "done"
                        ? "bg-success text-white shadow-sm"
                        : wp.status === "current"
                          ? "bg-primary text-white animate-pulse"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {wp.status === "done" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-foreground text-xs">
                        {wp.title}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {wp.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground/80 shrink-0" />
                      <span>{wp.location}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground/90 pt-0.5">
                      {wp.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex-row flex-wrap items-center justify-between gap-2">
          {onOpenQr ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onOpenQr();
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <QrCode className="size-3.5" />
              <span>{t("hospital.generateQrVoucher", "إصدار تذكرة QR للمريض والسداد")}</span>
            </Button>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close", "إغلاق")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
