import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

type BannerVariant = "info" | "warning" | "danger" | "success";

const variantStyles: Record<BannerVariant, {
  container: string;
  icon: LucideIcon;
  iconClass: string;
}> = {
  info:    { container: "banner-info",    icon: Info,          iconClass: "text-indigo-400" },
  warning: { container: "banner-warning", icon: AlertTriangle, iconClass: "text-amber-400" },
  danger:  { container: "banner-danger",  icon: XCircle,       iconClass: "text-red-400" },
  success: { container: "banner-success", icon: CheckCircle,   iconClass: "text-emerald-400" },
};

interface InfoBannerProps {
  variant?:   BannerVariant;
  icon?:      LucideIcon;
  children:   ReactNode;
  className?: string;
}

export function InfoBanner({
  variant = "info",
  icon,
  children,
  className,
}: InfoBannerProps) {
  const s = variantStyles[variant];
  const Icon = icon ?? s.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
      s.container,
      className,
    )}>
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", s.iconClass)} />
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
}
