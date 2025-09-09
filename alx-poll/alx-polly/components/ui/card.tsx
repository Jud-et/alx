import * as React from "react";

export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      className,
    ].join(" ")}
    {...props}
  />
);

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["flex flex-col space-y-1.5 p-6", className].join(" ")} {...props} />
);

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={["text-xl font-semibold leading-none tracking-tight", className].join(" ")} {...props} />)
;

export const CardDescription = ({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={["text-sm text-muted-foreground", className].join(" ")} {...props} />
);

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["p-6 pt-0", className].join(" ")} {...props} />
);

export const CardFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["flex items-center p-6 pt-0", className].join(" ")} {...props} />
);

export default Card;



