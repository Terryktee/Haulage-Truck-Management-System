import { useState, useMemo } from "react";
import { useFleet } from "@/context/FleetContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, ArrowRight, Truck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const columns = [
  { status: "pending", label: "Pending", colorClass: "border-t-muted-foreground" },
  { status: "in-progress", label: "In Progress", colorClass: "border-t-status-transit" },
  { status: "completed", label: "Completed", colorClass: "border-t-status-available" },
  { status: "cancelled", label: "Cancelled", colorClass: "border-t-status-maintenance" },
];

const statusBadgeStyles = {
  pending: "bg-secondary text-muted-foreground border-0",
  "in-progress": "bg-status-transit-bg text-status-transit border-0",
  completed: "bg-status-available-bg text-status-available border-0",
  cancelled: "bg-status-maintenance-bg text-status-maintenance border-0",
};

export default function JobsPage() {
  const { jobs, getTruckById, getDriverById } = useFleet();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("all");
  const [truckFilter, setTruckFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (truckFilter !== "all" && j.truckId !== truckFilter) return false;
      if (driverFilter !== "all" && j.driverId !== driverFilter) return false;
      return true;
    });
  }, [jobs, statusFilter, truckFilter, driverFilter]);

  const uniqueTruckIds = [
    ...new Set(jobs.map((j) => j.truckId).filter(Boolean)),
  ];

  const uniqueDriverIds = [
    ...new Set(jobs.map((j) => j.driverId).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Jobs & Deliveries
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage delivery jobs
          </p>
        </div>

        <Button onClick={() => navigate("/jobs/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {columns.map((c) => (
              <SelectItem key={c.status} value={c.status}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={truckFilter} onValueChange={setTruckFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Truck" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trucks</SelectItem>
            {uniqueTruckIds.map((id) => {
              const t = getTruckById(id);
              return (
                <SelectItem key={id} value={id}>
                  {t?.registration ?? id}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={driverFilter} onValueChange={setDriverFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {uniqueDriverIds.map((id) => {
              const d = getDriverById(id);
              return (
                <SelectItem key={id} value={id}>
                  {d?.name ?? id}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const colJobs = filteredJobs.filter((j) => j.status === col.status);

          return (
            <div
              key={col.status}
              className={`rounded-xl border bg-card border-t-4 ${col.colorClass}`}
            >
              <div className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold">
                    {col.label}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {colJobs.length}
                  </Badge>
                </div>
              </div>

              <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                {colJobs.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    No jobs
                  </p>
                )}

                {colJobs.map((job) => {
                  const truck = job.truckId
                    ? getTruckById(job.truckId)
                    : null;

                  const driver = job.driverId
                    ? getDriverById(job.driverId)
                    : null;

                  return (
                    <div
                      key={job.id}
                      className="rounded-lg border bg-background p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-medium">
                          {job.id}
                        </span>
                        <Badge
                          className={`text-[10px] ${statusBadgeStyles[job.status]}`}
                        >
                          {job.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {job.pickupLocation}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {job.deliveryLocation}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {truck && (
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {truck.registration}
                          </span>
                        )}

                        {driver && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {driver.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}