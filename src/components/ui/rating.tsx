import { BRAND, BRAND_GOLD, BRAND_LIGHT } from "@/lib/utils";

export function Rating({
  value,
  showValue = false,
  color = BRAND_GOLD,
}: {
  value: number;
  showValue?: boolean;
  color?: string;
}) {
  const full = Math.floor(value / 2);
  const half = value % 2 >= 1;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 10`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg key={i} width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <polygon
              points="5,0.5 6.2,3.7 9.5,3.7 6.9,5.8 7.9,9 5,7.1 2.1,9 3.1,5.8 0.5,3.7 3.8,3.7"
              fill={filled ? color : "transparent"}
              stroke={filled ? color : `${BRAND}66`}
              strokeWidth="0.6"
            />
          </svg>
        );
      })}
      {showValue && (
        <span
          className="ml-2 font-mono text-[10px] tracking-widest"
          style={{ color: BRAND_LIGHT }}
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}