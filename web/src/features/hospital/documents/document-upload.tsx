import { FileUp, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { SupportingDocument } from "@/features/hospital/types/hospital.types";
import { Button } from "@/shared/components/ui/button";
import { TechnicalText } from "@/shared/components/i18n/bidi-text";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 10 * 1024 * 1024;

interface DocumentUploadProps {
  onUploaded: (document: SupportingDocument) => void;
}

export function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
      setError(t("hospital.uploadTypeError"));
      return;
    }
    if (nextFile.size > maxFileSize) {
      setError(t("hospital.uploadSizeError"));
      return;
    }

    setFile(nextFile);
    setProgress(12);
    let nextProgress = 12;
    timerRef.current = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 22, 100);
      setProgress(nextProgress);

      if (nextProgress === 100) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        onUploaded({
          id: `doc-${crypto.randomUUID()}`,
          name: nextFile.name,
          sizeBytes: nextFile.size,
          mimeType: nextFile.type,
          uploadedAt: new Date().toISOString(),
          reviewStatus: "pending",
          source: "local_preview",
        });
      }
    }, 180);
  };

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setFile(null);
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
          className="flex min-h-40 w-full flex-col items-center justify-center border border-dashed border-input bg-surface-subtle px-5 py-8 text-center transition-colors hover:border-primary hover:bg-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files[0]);
          }}
        >
          <UploadCloud aria-hidden="true" className="size-7 text-primary" />
          <span className="mt-3 text-sm font-semibold">
            {t("hospital.chooseDocument")}
          </span>
          <span className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("hospital.uploadRequirements")}
          </span>
        </button>
      ) : (
        <div className="border border-border bg-surface-subtle p-4">
          <div className="flex items-start gap-3">
            <FileUp aria-hidden="true" className="mt-0.5 size-5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold"><TechnicalText>{file.name}</TechnicalText></p>
              <p className="mt-1 text-xs text-muted-foreground">
                {progress === 100
                  ? t("hospital.localPreviewComplete")
                  : t("hospital.preparingPreview", { progress })}
              </p>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={t("hospital.preparingFilePreview", { name: file.name })}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div className="flex h-full">
                  <div
                  className="h-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("hospital.clearSelectedDocument")}
              onClick={reset}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
