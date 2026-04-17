import { useFleet } from "@/context/FleetContext";

export function FleetStatusChart() {
  const { trucks } = useFleet();
  const available = trucks.filter((t) => t.status === "available").length;
  const transit = trucks.filter((t) => t.status === "in-transit").length;
  const maintenance = trucks.filter((t) => t.status === "maintenance").length;
  const total = trucks.length;

  const segments = [
    { label: "Available", count: available, colorClass: "bg-status-available", pct: total ? (available / total) * 100 : 0 },
    { label: "In Transit", count: transit, colorClass: "bg-status-transit", pct: total ? (transit / total) * 100 : 0 },
    { label: "Maintenance", count: maintenance, colorClass: "bg-status-maintenance", pct: total ? (maintenance / total) * 100 : 0 },
  ];

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-display text-base font-semibold">Fleet Status</h3>
      <p className="text-xs text-muted-foreground mb-4">Current truck availability</p>
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
        {segments.map((seg) => (
          <div key={seg.label} className={`${seg.colorClass} transition-all duration-500`} style={{ width: `${seg.pct}%` }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="text-center">
            <div className="font-display text-2xl font-bold">{seg.count}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className={`h-2 w-2 rounded-full ${seg.colorClass}`} />
              <span className="text-xs text-muted-foreground">{seg.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
