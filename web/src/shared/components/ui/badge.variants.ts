import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/35 focus:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20 font-semibold",
        secondary:
          "border border-slate-200/80 bg-slate-100 text-[#0e2430] font-medium",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 font-semibold",
        emergency:
          "bg-primary/10 text-primary border border-primary/25 font-semibold",
        outline: "bg-transparent text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
