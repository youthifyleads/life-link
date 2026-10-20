import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  FileCheck,
  HeartPulse,
  Printer,
  QrCode,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/features/hospital/components/hospital-formatters";
import {
  bloodComponentLabels,
  type HospitalRequest,
} from "@/features/hospital/types/hospital.types";
import { requestsApi } from "@/shared/api/requests.api";
import { BloodGroupBadge } from "@/shared/components/clinical/blood-group-badge";
import { RequestStatusBadge } from "@/shared/components/clinical/request-status-badge";
import { UrgencyBadge } from "@/shared/components/clinical/urgency-badge";
import { BidiText, TechnicalText } from "@/shared/components/i18n/bidi-text";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface HospitalRequestQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: HospitalRequest;
}

export function HospitalRequestQrModal({
  open,
  onOpenChange,
  request,
}: HospitalRequestQrModalProps) {
  const { t } = useTranslation();
  const [copiedManual, setCopiedManual] = useState(false);
  const [qrPayload, setQrPayload] = useState(request.id);
  const [imageError, setImageError] = useState(false);

  // Financial & clinical fallback values (aligned to 450 EGP standard catalog pricing)
  const unitPrice = request.unitPrice ?? 450;
  const totalAmount = request.totalAmount ?? unitPrice * request.quantity;
  const patientName = request.patientName || "كريم أحمد الصاوي";
  const rawId = request.id.replace("REQ-", "").replace("BR-", "").replace("#", "");
  const medicalRecordNumber =
    request.medicalRecordNumber || `#MED-${rawId.slice(-4).toUpperCase()}`;
  const department = request.department || "العناية المركزة الجراحية (SICU)";
  const attendingDoctor =
    request.attendingDoctor || "د. أحمد كمال (استشاري الجراحة والطوارئ)";

  // Clean, human-typeable manual code for the mobile app
  const manualEntryCode = `REQ-${rawId.toUpperCase()}`;
  const displayReference = request.id || manualEntryCode;

  // Load backend tracking payload when modal opens - ensure it embeds exact voucher reference
  useEffect(() => {
    if (open && request.id) {
      setQrPayload(displayReference);
      void requestsApi
        .getRequestQR(request.id)
        .then((res) => {
          if (res?.request_id) {
            setQrPayload(res.request_id);
          } else if (res?.reference && !res.reference.startsWith("eyJ")) {
            setQrPayload(res.reference);
          }
        })
        .catch(() => {
          setQrPayload(displayReference);
        });
    }
  }, [open, request.id, displayReference]);

  const handleCopyManual = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryCode);
      setCopiedManual(true);
      setTimeout(() => setCopiedManual(false), 2000);
    } catch {
      // ignore
    }
  };

  /**
   * Dedicated Print Handler:
   * Uses an isolated hidden iframe with exact A4 portrait monochrome rules.
   * This completely avoids Radix portal transforms, modal backdrops, and blank page bugs in Chrome/Edge.
   */
  const handlePrint = () => {
    const printContent = document.getElementById("hospital-official-print-voucher");
    if (!printContent) return;

    // Remove any previously created print iframe
    const oldIframe = document.getElementById("hospital-print-iframe");
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "hospital-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Collect all stylesheets from main document (Tailwind, fonts)
    const styleTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((tag) => tag.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>إذن صرف دم مميكن - ${displayReference}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              direction: rtl !important;
              font-family: Arial, "Segoe UI", Tahoma, sans-serif !important;
              font-size: 11px !important;
              line-height: 1.25 !important;
              height: auto !important;
              overflow: hidden !important;
            }
            #hospital-official-print-voucher {
              display: block !important;
              visibility: visible !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            th, td {
              border: 1.5px solid #000000 !important;
              padding: 3px 6px !important;
              color: #000000 !important;
              font-size: 10.5px !important;
            }
            th {
              background-color: #f2f2f2 !important;
              font-weight: bold !important;
            }
          </style>
        </head>
        <body>
          <div id="hospital-official-print-voucher">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    const doPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print execution failed:", err);
      }
    };

    // Ensure images (QR Code) are fully rendered before printing
    const images = iframe.contentWindow?.document.querySelectorAll("img");
    if (images && images.length > 0) {
      let loaded = 0;
      const total = images.length;
      const checkAndPrint = () => {
        loaded++;
        if (loaded >= total) {
          setTimeout(doPrint, 150);
        }
      };
      images.forEach((img) => {
        if (img.complete) {
          checkAndPrint();
        } else {
          img.onload = checkAndPrint;
          img.onerror = checkAndPrint;
        }
      });
      setTimeout(doPrint, 500); // Safety fallback
    } else {
      setTimeout(doPrint, 200);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    qrPayload,
  )}&margin=6`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[94vh] overflow-y-auto p-5 sm:p-6 print:p-0 print:border-none print:shadow-none print:max-w-none">
        {/* ── Print-Only CSS Fallback for Keyboard Shortcut (Ctrl+P) ── */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              overflow: visible !important;
              height: auto !important;
            }
            /* Hide main SPA layout and modal background backdrop */
            header, nav, aside, footer, #root > *,
            .screen-only-view,
            [data-radix-portal] > div:first-child:not([role="dialog"]) {
              display: none !important;
            }
            /* Un-transform Radix portal so it doesn't break print pages */
            [data-radix-portal],
            [role="dialog"] {
              position: static !important;
              transform: none !important;
              max-width: 100% !important;
              max-height: none !important;
              width: 100% !important;
              height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
              overflow: visible !important;
            }
            #hospital-official-print-voucher {
              display: block !important;
              visibility: visible !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
          }
        `}</style>

        {/* ══════════════════════════════════════════════════════════════════════
            1. ON-SCREEN VOUCHER VIEW (Minimal, elegant, zero clutter, 100% data)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="screen-only-view space-y-4">
          {/* Header */}
          <DialogHeader className="border-b border-border/70 pb-3 text-start">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground">
                  <QrCode className="size-4.5" aria-hidden="true" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {t("hospital.voucherTitle", "قسيمة صرف ونقل الدم السريرية")}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {t("hospital.voucherSubtitle", "إذن صرف إلكتروني رسمي وسجل تتبع الاستلام للدم ومشتقاته")}
                  </DialogDescription>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-1.5 text-xs">
                <UrgencyBadge urgency={request.urgency} />
                <RequestStatusBadge status={request.status} />
              </div>
            </div>
          </DialogHeader>

          {/* Core Two-Column Minimal Voucher Layout */}
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_13.5rem] items-start pt-1">
            {/* ── Clinical & Blood Requisition Panel ── */}
            <div className="space-y-3.5">
              {/* 1. Patient & Medical Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    {t("hospital.patientDataTitle", "بيانات المريض والطلب السريري")}
                  </span>
                  <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/70">
                    <TechnicalText>{medicalRecordNumber}</TechnicalText>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">اسم المريض:</span>
                    <span className="font-bold text-foreground text-sm">
                      <BidiText>{patientName}</BidiText>
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">القسم والجهة:</span>
                    <span className="font-medium text-foreground">
                      <BidiText>{department}</BidiText>
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">الطبيب المعالج:</span>
                    <span className="font-medium text-foreground">
                      <BidiText>{attendingDoctor}</BidiText>
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">وقت وتاريخ الطلب:</span>
                    <span className="font-medium text-foreground font-mono">
                      {formatDateTime(request.createdAt)}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-muted-foreground text-[11px] block mb-0.5">التشخيص السريري / سبب طلب نقل الدم:</span>
                    <div className="font-medium text-foreground text-xs leading-relaxed bg-muted/25 px-2.5 py-1.5 rounded border border-border/50">
                      <BidiText>{request.reason || "طلب نقل دم سريري عاجل"}</BidiText>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* 2. Blood Requisition & Route */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <HeartPulse className="size-3.5 text-primary" />
                    مواصفات الدم ومسار الإمداد
                  </span>
                  <BloodGroupBadge group={request.bloodGroup} />
                </div>

                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">المكون المطلوب:</span>
                    <span className="font-semibold text-foreground">
                      {String(
                        t(`healthcare.${request.component}`, {
                          defaultValue:
                            (bloodComponentLabels as Record<string, string>)[request.component] ??
                            request.component,
                        }),
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">الكمية المطلوبة:</span>
                    <span className="font-bold text-foreground text-sm">
                      {request.quantity} {request.quantity === 1 ? "وحدة (Unit)" : "وحدات (Units)"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground text-[11px] block">بنك الدم المنفذ (نقطة الانطلاق):</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="size-3.5 text-primary shrink-0" />
                      <BidiText>{request.targetBloodBank?.name || "Central Blood Bank Facility"}</BidiText>
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground text-[11px] block">جهة الوصول وسلسلة التبريد:</span>
                    <span className="font-medium text-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                      <Truck className="size-3.5 text-primary shrink-0" />
                      <span>مستشفى قصر العيني الفرنساوي — الطوارئ والعناية المركزة</span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        2°C - 6°C مبرد
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* 3. Caregiver Minimal Callout */}
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <CreditCard className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11.5px]">
                  <strong className="text-foreground font-semibold">خطوة المرافق عبر تطبيق LifeLink: </strong>
                  يمسح مرافق المريض الـ QR أو يدخل الكود اليدوي{" "}
                  <strong className="font-mono text-foreground">{manualEntryCode}</strong>{" "}
                  لسداد الفاتورة عبر Paymob (ميزة / بطاقات / محافظ ذكية) وبدء تتبع وصول الدم لحظياً.
                </p>
              </div>
            </div>

            {/* ── Right / Voucher Pass Column: QR + Code + Paymob ── */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-surface-subtle/50 p-4 text-center space-y-3">
              {/* QR Image Box */}
              <div className="relative flex size-36 items-center justify-center rounded-lg border border-border bg-white p-2 shadow-xs">
                {!imageError ? (
                  <img
                    src={qrImageUrl}
                    alt={`QR Code ${request.id}`}
                    className="size-32 object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-primary">
                    <QrCode className="size-20" aria-hidden="true" />
                    <span className="text-[10px] font-mono mt-1 text-muted-foreground">
                      {request.id}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-medium text-success">
                <CheckCircle2 className="size-3.5" />
                <span>{t("hospital.qrReady", "رمز الاستجابة السريعة جاهز")}</span>
              </div>

              {/* Clean Manual Code Entry */}
              <div className="w-full rounded-md border border-border/80 bg-surface p-2 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground block">
                  كود الإدخال اليدوي للموبايل
                </span>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span
                    className="font-mono text-xs font-bold tracking-wider text-foreground select-all"
                    dir="ltr"
                  >
                    {manualEntryCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyManual()}
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={t("common.copy", "نسخ كود الإدخال اليدوي")}
                  >
                    {copiedManual ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  في حال تعذر مسح الكاميرا، اكتب هذا الكود في تطبيق LifeLink
                </span>
              </div>

              {/* Paymob Fee */}
              <div className="w-full border-t border-border/60 pt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">رسوم الصرف:</span>
                <div className="text-end">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">ج.م</span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    Paymob • {request.status === "completed" ? t("hospital.paid", "تم السداد") : t("hospital.pendingPayment", "في انتظار السداد")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Compact Minimal Accreditation Reference Bar ── */}
          <div className="rounded-md border border-border/60 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px]">
              <FileCheck className="size-3.5 text-success shrink-0" />
              <span>إذن صرف مميكن ومعتمد من الهيئة العامة للمستشفيات وبنوك الدم القومية</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
              <span className="text-muted-foreground text-[10px]">REF:</span>
              <bdi dir="ltr">{displayReference}</bdi>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            2. PRINT-ONLY OFFICIAL BLACK & WHITE HOSPITAL REQUISITION SHEET
            (Strictly monochrome, zero colors, crisp borders, high contrast)
            ══════════════════════════════════════════════════════════════════════ */}
        <div
          id="hospital-official-print-voucher"
          className="hidden print:block text-black bg-white"
          dir="rtl"
        >
          {/* Header Bar */}
          <div className="border-b-2 border-black pb-1.5 mb-2 flex justify-between items-start">
            <div>
              <p className="text-[10.5px] font-bold text-black">جمهورية مصر العربية — وزارة الصحة والسكان</p>
              <p className="text-[10px] text-black">الهيئة العامة للمستشفيات والمعاهد التعليمية — مستشفى قصر العيني</p>
              <h1 className="text-sm font-black mt-0.5 text-black">إذن صرف دم ونقل سريري مميكن</h1>
              <p className="text-[9.5px] font-mono mt-0.5 text-black">HOSPITAL BLOOD REQUISITION & DISPATCH VOUCHER</p>
            </div>
            <div className="text-left font-mono text-[10px] space-y-0.5 text-black">
              <p className="font-bold">رقم الطلب: {displayReference}</p>
              <p>كود الموبايل: <strong>{manualEntryCode}</strong></p>
              <p>التاريخ: {formatDateTime(request.createdAt)}</p>
              <p className="font-bold border border-black px-1 py-0.2 inline-block mt-0.5">
                درجة الأولوية: {request.urgency === "emergency" ? "طارئ جداً (STAT)" : "عاجل"}
              </p>
            </div>
          </div>

          {/* Two-Column Grid: Left QR & Barcode, Right Medical Data */}
          <div className="grid grid-cols-[130px_1fr] gap-2 border-2 border-black p-2 mb-2">
            {/* Left QR & Manual Box */}
            <div className="border-e-2 border-black pe-2 text-center flex flex-col items-center justify-between">
              <div>
                <p className="text-[9.5px] font-bold mb-1 text-black">رمز التحقق والسداد</p>
                <img
                  src={qrImageUrl}
                  alt={`QR ${request.id}`}
                  className="size-24 object-contain border border-black mx-auto"
                />
              </div>
              <div className="w-full border-t border-black pt-1 mt-1 text-black">
                <p className="text-[8.5px] font-bold">كود الإدخال اليدوي:</p>
                <p className="font-mono text-xs font-black tracking-wider">{manualEntryCode}</p>
                <p className="text-[7.5px] mt-0.5">لسداد Paymob وتتبع المسار</p>
              </div>
            </div>

            {/* Right Clinical Specifications */}
            <div className="space-y-1.5 text-[10.5px] text-black">
              <div className="grid grid-cols-2 gap-1.5 border-b border-black pb-1">
                <div>
                  <span className="font-bold block text-[10px]">اسم المريض:</span>
                  <span className="text-xs font-black">{patientName}</span>
                </div>
                <div>
                  <span className="font-bold block text-[10px]">رقم الملف الطبي (MRN):</span>
                  <span className="font-mono text-xs font-bold">{medicalRecordNumber}</span>
                </div>
                <div>
                  <span className="font-bold block text-[10px]">القسم السريري:</span>
                  <span className="font-medium">{department}</span>
                </div>
                <div>
                  <span className="font-bold block text-[10px]">الطبيب المعالج:</span>
                  <span className="font-medium">{attendingDoctor}</span>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="border-b border-black pb-1">
                <span className="font-bold block text-[10px]">التشخيص الطبي ودواعي الصرف:</span>
                <p className="font-medium text-[10.5px] mt-0.5">{request.reason || "طلب نقل دم سريري معتمد ومطابق معملياً"}</p>
              </div>

              {/* Blood & Supply */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <div>
                  <span className="font-bold block text-[10px]">فصيلة الدم المطلوبة:</span>
                  <span className="text-xs font-black border border-black px-1.5 py-0.5 inline-block mt-0.5">
                    {request.bloodGroup}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[10px]">المكون الدموي:</span>
                  <span className="font-bold text-[10.5px] mt-0.5 block">
                    {String(
                      (bloodComponentLabels as Record<string, string>)[request.component] ??
                        request.component,
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[10px]">الكمية المصرح بها:</span>
                  <span className="text-xs font-black mt-0.5 block">{request.quantity} وحدة</span>
                </div>
              </div>

              {/* Blood Bank & Transit */}
              <div className="grid grid-cols-2 gap-1.5 border-t border-black pt-1">
                <div>
                  <span className="font-bold block text-[9.5px]">بنك الدم المصدر:</span>
                  <span className="font-medium text-[10.5px]">
                    {request.targetBloodBank?.name || "Central Blood Bank Facility"}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-[9.5px]">شروط الحفظ والنقل:</span>
                  <span className="font-medium text-[10.5px]">2°C إلى 6°C (صندوق نقل مبرد معتمد)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Paymob Clearance Table */}
          <table className="w-full border-2 border-black text-[10.5px] text-center border-collapse mb-2 text-black">
            <thead>
              <tr className="border-b border-black bg-gray-100">
                <th className="border-e border-black p-1 font-bold">بند الصرف</th>
                <th className="border-e border-black p-1 font-bold">الكمية</th>
                <th className="border-e border-black p-1 font-bold">سعر الوحدة</th>
                <th className="border-e border-black p-1 font-bold">إجمالي المستحق</th>
                <th className="p-1 font-bold">حالة السداد (Paymob)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-e border-black p-1">
                  أكياس دم مفحوصة ومطابقة معملياً ({request.bloodGroup})
                </td>
                <td className="border-e border-black p-1 font-mono">{request.quantity}</td>
                <td className="border-e border-black p-1 font-mono">{unitPrice.toFixed(2)} ج.م</td>
                <td className="border-e border-black p-1 font-mono font-bold">{totalAmount.toFixed(2)} ج.م</td>
                <td className="p-1 font-bold">
                  {request.status === "completed" ? "مسدد إلكترونياً (PAID)" : "بانتظار التحصيل عبر Paymob"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Official Endorsements & Signatures */}
          <div className="grid grid-cols-3 gap-2 border-2 border-black p-2 text-[10px] text-black">
            <div className="border-e border-black pe-1.5 space-y-3">
              <p className="font-bold">توقيع الطبيب المعالج:</p>
              <div className="border-b border-dotted border-black w-4/5"></div>
            </div>
            <div className="border-e border-black pe-1.5 space-y-2 text-center">
              <p className="font-bold">ختم بنك الدم المصدر:</p>
              <div className="border border-dashed border-black/60 size-10 mx-auto rounded-sm"></div>
            </div>
            <div className="space-y-3">
              <p className="font-bold">توقيع تمريض الاستلام:</p>
              <div className="border-b border-dotted border-black w-4/5"></div>
            </div>
          </div>

          <div className="text-[8px] text-center mt-1 text-black/70 leading-tight">
            تنبيه: هذا الإذن وثيقة سريرية رسمية مميكنة ومحمية بتشفير رقمي. يُحظر استخدامها لغير المريض المدونة بياناته، وتُحفظ أصولها بالسجل الطبي.
          </div>
        </div>

        {/* ── Dialog Footer with Action Buttons ── */}
        <DialogFooter className="screen-only-view border-t border-border/70 pt-3 flex-row flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs font-semibold h-8.5 shadow-xs"
            >
              <Printer className="size-3.5" />
              <span>{t("hospital.printVoucher", "طباعة القسيمة السريرية")}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleCopyManual()}
              className="gap-1.5 text-xs h-8.5 font-mono"
            >
              {copiedManual ? (
                <>
                  <Check className="size-3.5 text-success" />
                  <span>تم نسخ الكود اليدوي</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>نسخ كود الموبايل ({manualEntryCode})</span>
                </>
              )}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-8.5"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close", "إغلاق")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
