import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-2xs hover:bg-primary-hover active:bg-[#8e1b1b]",
        secondary:
          "border border-slate-200/90 bg-slate-100 text-[#0e2430] hover:bg-slate-200 active:bg-slate-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        emergency:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-[#8e1b1b] shadow-2xs",
        ghost: "text-[#0e2430] hover:bg-muted active:bg-slate-200/60",
        link: "min-h-0 px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-11 px-4",
        icon: "size-9 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
