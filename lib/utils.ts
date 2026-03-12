import { clsx, type ClassValue } from "clsx";

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a number as USD. */
export function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style:                 "currency",
    currency:              "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/** Truncate a string to max length with ellipsis. */
export function truncate(s: string, max = 60) {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/** Return a human-readable time difference ("5m ago", "2h ago"). */
export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const s    = Math.floor(diff / 1000);
  if (s < 60)       return `${s}s ago`;
  if (s < 3600)     return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)    return `${Math.floor(s / 3600)}h ago`;
  return             `${Math.floor(s / 86400)}d ago`;
}
