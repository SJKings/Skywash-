import { CarFront, House, Truck, type LucideProps } from "lucide-react";
import type { ServiceMode } from "@/lib/generated/prisma/enums";

const ICONS = { HOME: House, PICKUP: Truck, DRIVE_IN: CarFront };

export function ModeIcon({ mode, ...props }: { mode: ServiceMode } & LucideProps) {
  const Icon = ICONS[mode];
  return <Icon aria-hidden {...props} />;
}
