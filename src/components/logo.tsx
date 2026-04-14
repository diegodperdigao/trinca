import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

export function Logo({ className, compact }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <TriangleMark />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            A trinca do
          </span>
          <span className="text-sm font-extrabold tracking-wide text-foreground">
            iGaming CRM
          </span>
        </div>
      )}
    </div>
  );
}

function TriangleMark() {
  return (
    <svg
      width="28"
      height="26"
      viewBox="0 0 28 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_12px_rgba(242,24,40,0.45)]"
    >
      <defs>
        <linearGradient id="triGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fc4053" />
          <stop offset="60%" stopColor="#f21828" />
          <stop offset="100%" stopColor="#b81425" />
        </linearGradient>
      </defs>
      <path
        d="M14 2L26 22H2L14 2Z"
        fill="url(#triGrad)"
        stroke="#fc4053"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
