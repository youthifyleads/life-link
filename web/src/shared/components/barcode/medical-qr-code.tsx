import QRCode from "qrcode";
import { useEffect, useState } from "react";

export interface MedicalQrCodeProps {
  /** Text or URL payload encoded in the QR code */
  value: string;
  /** Dimension in pixels (both width and height) */
  size?: number;
  /** Quiet zone margin modules around the code (default 1) */
  margin?: number;
  /** Error correction level according to ISO/IEC 18004 */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Custom CSS classes */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
}

/**
 * Medical-grade Scalable Vector QR Code Component
 * Renders high-contrast, razor-sharp SVG QR codes for clinical traceability and mobile verification.
 */
export function MedicalQrCode({
  value,
  size = 80,
  margin = 1,
  errorCorrectionLevel = "M",
  className = "",
  ariaLabel,
}: MedicalQrCodeProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;
    if (!value) {
      setSvgMarkup("");
      return;
    }

    QRCode.toString(value, {
      type: "svg",
      margin,
      errorCorrectionLevel,
      width: size,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((svg) => {
        if (!isCancelled) {
          setSvgMarkup(svg);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSvgMarkup("");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [value, size, margin, errorCorrectionLevel]);

  if (!value) return null;

  if (!svgMarkup) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-muted/40 rounded border border-border/50 animate-pulse ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel || `QR Code for ${value}`}
      className={`inline-flex items-center justify-center select-none overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
