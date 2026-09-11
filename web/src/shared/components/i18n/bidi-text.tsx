import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface BidiTextProps<T extends ElementType = "bdi"> {
  as?: T;
  children: ReactNode;
  className?: string;
}

export function BidiText<T extends ElementType = "bdi">({
  as,
  children,
  className,
  ...props
}: BidiTextProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof BidiTextProps<T>>) {
  const Component = as ?? "bdi";

  return (
    <Component dir="auto" className={cn("unicode-isolate", className)} {...props}>
      {children}
    </Component>
  );
}

interface TechnicalTextProps<T extends ElementType = "bdi"> {
  as?: T;
  children: ReactNode;
  className?: string;
}

export function TechnicalText<T extends ElementType = "bdi">({
  as,
  children,
  className,
  ...props
}: TechnicalTextProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TechnicalTextProps<T>>) {
  const Component = as ?? "bdi";

  return (
    <Component
      dir="ltr"
      className={cn("unicode-isolate tabular-nums", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
