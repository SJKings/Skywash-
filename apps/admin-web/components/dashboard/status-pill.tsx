import { STATUS_STYLES } from "@/lib/format";
import type { BookingStatus } from "@/lib/generated/prisma/enums";

export function StatusPill({ status, large }: { status: BookingStatus; large?: boolean }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`whitespace-nowrap rounded-[20px] text-xs font-semibold ${large ? "px-2.5 py-[5px]" : "px-[9px] py-1"}`}
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
