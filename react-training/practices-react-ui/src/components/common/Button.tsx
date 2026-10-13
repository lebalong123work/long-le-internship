import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "add" | "danger" | "neutral";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
}

export function Button({
  variant,
  className,
  type = "button",
  ...buttonProps
}: Readonly<ButtonProps>) {
  const classes = ["btn", `btn-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return <button {...buttonProps} className={classes} type={type} />;
}
