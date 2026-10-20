import { FileUp, LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { SupportingDocument } from "@/features/hospital/types/hospital.types";
import { formatFileSize } from "@/features/hospital/components/hospital-formatters";
import { Button } from "@/shared/components/ui/button";
import { TechnicalText } from "@/shared/components/i18n/bidi-text";

import { useUploadHospitalDocument } from "@/features/hospital/hooks/use-hospital-requests";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 10 * 1024 * 1024;

interface DocumentUploadProps {
  requestId?: string;
  onUploaded: (document: SupportingDocument) => void;
}

export function DocumentUpload({ requestId, onUploaded }: DocumentUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadHospitalDocument();

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  const selectFile = (nextFile?: File) => {
    setError(null);

    if (!nextFile) return;
    if (!allowedTypes.includes(nextFile.type)) {
      setError(t("hospital.uploadTypeError", "نوع الملف غير مدعوم. الصيغ المسموحة: PDF، JPEG، PNG"));
      return;
    }
    if (nextFile.size > maxFileSize) {
      setError(t("hospital.uploadSizeError", "حجم الملف يتجاوز الحد الأقصى (10 ميجابايت)"));
      return;
    }

    setFile(nextFile);
    setIsUploading(false);
    setProgress(0);
  };

  const startUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    if (requestId) {
      setProgress(40);
      uploadMutation.mutate(
        {
          requestId,
          file: {
            name: file.name,
            sizeBytes: file.size,
            mimeType: file.type,
            rawFile: file,
          },
        },
        {
          onSuccess: (result) => {
            setProgress(100);
            const doc = result.document;
            onUploaded({
              id: doc.id,
              name: doc.name,
              sizeBytes: doc.sizeBytes,
              mimeType: doc.mimeType,
              uploadedAt: doc.uploadedAt,
              reviewStatus: doc.reviewStatus,
              source: doc.source,
              url: doc.url || URL.createObjectURL(file),
            });
            setTimeout(() => {
              reset();
            }, 1200);
          },
          onError: (err: any) => {
            setIsUploading(false);
            setProgress(0);
            setError(
              err?.message ||
                t("hospital.uploadFailed", "فشل رفع الملف إلى الخادم. يرجى المحاولة مرة أخرى."),
            );
          },
        },
      );
      return;
    }

    setProgress(15);
    let nextProgress = 15;
    timerRef.current = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 25, 100);
      setProgress(nextProgress);

      if (nextProgress === 100) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        const blobUrl = URL.createObjectURL(file);
        onUploaded({
          id: `doc-${crypto.randomUUID()}`,
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          reviewStatus: "pending",
          source: "local_preview",
          url: blobUrl,
        });
        setTimeout(() => {
          reset();
        }, 1000);
      }
    }, 150);
  };

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setFile(null);
    setIsUploading(false);
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {!file ? (
        <button
          type="button"
          className="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-input bg-surface-subtle px-5 py-7 text-center transition-colors hover:border-primary hover:bg-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files[0]);
          }}
        >
          <UploadCloud aria-hidden="true" className="size-8 text-primary" />
          <span className="mt-2.5 text-sm font-semibold">
            {t("hospital.chooseDocument", "اختر ملف المستند السريري")}
          </span>
          <span className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("hospital.uploadRequirements", "PDF، JPEG، PNG حتى 10 ميجابايت")}
          </span>
        </button>
      ) : (
        <div className="rounded-lg border border-border bg-surface-subtle p-4 shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
              <FileUp aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                <TechnicalText>{file.name}</TechnicalText>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {formatFileSize(file.size)} · {file.type || "application/octet-stream"}
              </p>
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={t("hospital.clearSelectedDocument", "إلغاء الملف المختار")}
                onClick={reset}
                title={t("hospital.cancelFile", "إلغاء الملف المختار")}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            )}
          </div>

          {/* Progress or confirmation action buttons */}
          {isUploading ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {progress === 100
                    ? t("hospital.uploadSuccess", "تم الرفع بنجاح!")
                    : t("hospital.uploadingProgress", "جاري رفع الملف إلى الخادم...")}
                </span>
                <span className="font-mono font-medium">{progress}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={t("hospital.preparingFilePreview", { name: file.name })}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={reset}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>{t("hospital.cancelFileAction", "إلغاء وإزالة الملف")}</span>
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={startUpload}
                disabled={uploadMutation.isPending}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                {uploadMutation.isPending ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="size-3.5" />
                )}
                <span>{t("hospital.confirmUploadAction", "تأكيد ورفع الملف")}</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded border border-destructive/20" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
