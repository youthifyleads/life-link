import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-base text-foreground shadow-[inset_0_1px_1px_rgb(10_30_40/0.025)] transition-[border-color,box-shadow,background-color] duration-150 outline-none placeholder:text-muted-foreground hover:border-muted-foreground/45 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
