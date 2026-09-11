import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-clinical-navy",
        secondary:
          "border border-border bg-surface text-foreground hover:bg-secondary active:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#951d14] active:bg-[#79170f]",
        ghost: "text-foreground hover:bg-muted active:bg-secondary",
        link: "min-h-0 px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-3",
        lg: "h-12 px-5 text-base",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
