import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

export interface MedicalBarcodeProps {
  /** The data value to encode in the barcode */
  value: string;
  /** Barcode symbology format, defaults to CODE128 for ISBT 128 compliance */
  format?: "CODE128" | "CODE128A" | "CODE128B" | "CODE128C" | "CODE39";
  /** Single bar module width in px (defaults to 1.5) */
  width?: number;
  /** Barcode bar height in px (defaults to 40) */
  height?: number;
  /** Whether to render eye-readable text beneath the bars */
  displayValue?: boolean;
  /** Custom text to display instead of the raw value */
  text?: string;
  /** Font size for eye-readable text */
  fontSize?: number;
  /** Outer margins around the barcode (defaults to 2) */
  margin?: number;
  /** Additional CSS class names for the SVG container */
  className?: string;
}

/**
 * Medical-grade SVG Linear Barcode Component
 * Compliant with ISBT 128 / Code 128 symbology for clinical blood bags and lab specimens.
 */
export function MedicalBarcode({
  value,
  format = "CODE128",
  width = 1.6,
  height = 42,
  displayValue = true,
  text,
  fontSize = 11,
  margin = 2,
  className = "",
}: MedicalBarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue,
        text,
        fontSize,
        font: "monospace",
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 3,
        background: "transparent",
        lineColor: "#000000",
        margin,
      });
    } catch {
      // Gracefully handle malformed character sequence
    }
  }, [value, format, width, height, displayValue, text, fontSize, margin]);

  if (!value) return null;

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={`Barcode: ${value}`}
      className={`max-w-full h-auto text-black select-none ${className}`}
    />
  );
}
