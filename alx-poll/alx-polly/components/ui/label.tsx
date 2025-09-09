import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className = "", ...props }: LabelProps) => {
  return (
    <label
      className={["text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className].join(" ")}
      {...props}
    />
  );
};

export default Label;



