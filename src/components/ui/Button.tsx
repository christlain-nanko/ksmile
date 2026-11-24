import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "cart";

const variants: Record<Variant, string> = {
  primary:
    "bg-ksmile-green text-white hover:bg-ksmile-green-dark disabled:bg-ksmile-green/40",
  secondary:
    "bg-white text-ksmile-green border border-ksmile-line hover:border-ksmile-green",
  ghost: "bg-transparent text-ksmile-green hover:bg-ksmile-green-soft",
  cart:
    "bg-ksmile-green text-white hover:bg-ksmile-green-dark disabled:bg-ksmile-line disabled:text-ksmile-muted",
};

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "md";
};

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = Common & {
  href: string;
  disabled?: boolean;
};

export function Button({
  children,
  variant = "primary",
  className = "",
  fullWidth,
  size = "md",
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = [
    "inline-flex items-center justify-center gap-1.5 font-semibold transition-colors",
    size === "sm" ? "rounded-md px-3 py-2 text-xs" : "rounded-md px-4 py-2.5 text-sm",
    "disabled:cursor-not-allowed",
    fullWidth ? "w-full" : "",
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href) {
    const { href, disabled, ...rest } = props;
    if (disabled) {
      return (
        <span className={`${classes} pointer-events-none opacity-50`} {...rest}>
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
