import { Droplets } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const tile = size === "sm" ? "size-[30px] rounded-[9px]" : "size-[34px] rounded-[10px]";
  return (
    <span className="flex items-center gap-2.5 text-slate-900">
      <span className={`flex items-center justify-center bg-sky-500 text-white ${tile}`}>
        <Droplets size={size === "sm" ? 15 : 17} aria-hidden />
      </span>
      <span className={`font-extrabold ${size === "sm" ? "text-lg" : "text-xl"}`}>Skywash</span>
    </span>
  );
}
