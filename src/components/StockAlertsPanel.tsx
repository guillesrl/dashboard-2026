import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, PackageX } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStockAlerts, STOCK_LOW_THRESHOLD } from "@/hooks/use-stock-alerts";

export function StockAlertsPanel() {
  const { alerts, criticalCount, lowCount, totalAlerts } = useStockAlerts();
  const [expanded, setExpanded] = useState(false);

  if (totalAlerts === 0) return null;

  const hasCritical = criticalCount > 0;

  return (
    <div className="px-4 pb-2 md:container md:mx-auto md:px-4">
      <Alert
        variant={hasCritical ? "destructive" : "default"}
        className={
          hasCritical
            ? "py-2 border-red-500 bg-red-50 dark:bg-red-950/20"
            : "py-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 [&>svg]:text-amber-500"
        }
      >
        <AlertTriangle className="h-4 w-4" />
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-sm font-semibold mb-0 flex flex-wrap items-center gap-1.5">
              Stock bajo
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalCount} sin stock
                </Badge>
              )}
              {lowCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-400 text-amber-700 dark:text-amber-300"
                >
                  {lowCount} bajo ({`<${STOCK_LOW_THRESHOLD}`})
                </Badge>
              )}
            </AlertTitle>

            {expanded && (
              <div className="mt-3 space-y-1">
                {alerts.map(({ item, level }) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                      level === "critical"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {level === "critical" ? (
                        <PackageX className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="text-muted-foreground capitalize hidden sm:inline">
                        · {item.category}
                      </span>
                    </div>
                    <Badge
                      variant={level === "critical" ? "destructive" : "outline"}
                      className={`ml-2 flex-shrink-0 text-xs ${
                        level === "low"
                          ? "border-amber-400 text-amber-700 dark:text-amber-300"
                          : ""
                      }`}
                    >
                      {level === "critical" ? "Sin stock" : `Stock: ${item.stock}`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-7 px-2 text-xs"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Ver todos
              </>
            )}
          </Button>
        </div>
      </Alert>
    </div>
  );
}
