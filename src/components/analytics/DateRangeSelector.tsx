import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RANGE_PRESETS, RangeKey } from "@/lib/dateRange";

interface DateRangeSelectorProps {
  value: RangeKey;
  customFrom: string;
  customTo: string;
  onChange: (key: RangeKey) => void;
  onCustomFrom: (v: string) => void;
  onCustomTo: (v: string) => void;
}

export function DateRangeSelector({
  value,
  customFrom,
  customTo,
  onChange,
  onCustomFrom,
  onCustomTo,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {RANGE_PRESETS.map((p) => (
          <Button
            key={p.key}
            size="sm"
            variant={value === p.key ? "default" : "outline"}
            onClick={() => onChange(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {value === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={customFrom}
            max={customTo || undefined}
            onChange={(e) => onCustomFrom(e.target.value)}
            className="h-9 w-auto"
          />
          <span className="text-muted-foreground text-sm">a</span>
          <Input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            onChange={(e) => onCustomTo(e.target.value)}
            className="h-9 w-auto"
          />
        </div>
      )}
    </div>
  );
}
