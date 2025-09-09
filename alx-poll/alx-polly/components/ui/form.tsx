import * as React from "react";

export const FormField = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["grid gap-2", className].join(" ")} {...props} />
);

export const FormLabel = ({ className = "", children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={["text-sm font-medium", className].join(" ")} {...props}>{children}</label>
);

export const FormDescription = ({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={["text-xs text-muted-foreground", className].join(" ")} {...props} />
);

export const FormMessage = ({ className = "", children }: { className?: string; children?: React.ReactNode }) => (
  children ? <p className={["text-xs text-destructive", className].join(" ")}>{children}</p> : null
);



