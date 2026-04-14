import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | Date, pattern = "dd/MM/yyyy") {
  return format(typeof iso === "string" ? new Date(iso) : iso, pattern, {
    locale: ptBR,
  });
}

export function formatDateTime(iso: string | Date) {
  return format(typeof iso === "string" ? new Date(iso) : iso, "dd/MM HH:mm", {
    locale: ptBR,
  });
}

export function formatRelative(iso: string | Date) {
  return formatDistanceToNow(typeof iso === "string" ? new Date(iso) : iso, {
    locale: ptBR,
    addSuffix: true,
  });
}

export function relativeDayLabel(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  return format(d, "EEE, dd/MM", { locale: ptBR });
}

/** Parse Instagram handle, strip @ and URL bits. */
export function cleanInstagramHandle(input: string | null | undefined) {
  if (!input) return null;
  let v = input.trim();
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  v = v.replace(/\/+$/, "");
  v = v.replace(/^@/, "");
  return v || null;
}

export function instagramUrl(handle: string | null | undefined) {
  const h = cleanInstagramHandle(handle);
  return h ? `https://instagram.com/${h}` : null;
}

/** Build a minimal RFC5545 .ics file as text for a single meeting. */
export function buildIcs({
  uid,
  title,
  description,
  location,
  startsAt,
  endsAt,
}: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt?: Date | null;
}) {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const end = endsAt ?? new Date(startsAt.getTime() + 30 * 60 * 1000);
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trinca CRM//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@trinca-crm`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(startsAt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    description ? `DESCRIPTION:${esc(description)}` : "",
    location ? `LOCATION:${esc(location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
