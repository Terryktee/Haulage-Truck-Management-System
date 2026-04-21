import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MapPin, ArrowRight, Truck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

const columns = [
  { status: "pending", label: "Pending", colorClass: "border-t-muted-foreground" },
  { status: "assigned", label: "Assigned", colorClass: "border-t-status-transit" },
  { status: "completed", label: "Completed", colorClass: "border-t-status-available" },
  { status: "cancelled", label: "Cancelled", colorClass: "border-t-status-maintenance" },
];

const statusBadgeStyles = {
  pending: "bg-secondary text-muted-foreground border-0",
  assigned: "bg-status-transit-bg text-status-transit border-0",
  completed: "bg-status-available-bg text-status-available border-0",
  cancelled: "bg-status-maintenance-bg text-status-maintenance border-0",
};

export default function JobsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [truckFilter, setTruckFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, trucksRes, driversRes] = await Promise.all([
        api.get("/jobs/"),
        api.get("/trucks/"),
        api.get("/drivers"),
      ]);

      setJobs(jobsRes.data);
      setTrucks(trucksRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error("Failed to load jobs data:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs data.",
        variant: "destructive",
      });
    }
  };

  const getTruckById = (id) =>
    trucks.find((truck) => truck.truck_id === id);

  const getDriverById = (id) =>
    drivers.find((driver) => driver.driver_id === id);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (truckFilter !== "all" && String(job.assigned_truck) !== truckFilter) return false;
      if (driverFilter !== "all" && String(job.assigned_driver) !== driverFilter) return false;
      return true;
    });
  }, [jobs, statusFilter, truckFilter, driverFilter]);

  const uniqueTruckIds = [
    ...new Set(jobs.map((job) => job.assigned_truck).filter(Boolean)),
  ];

  const uniqueDriverIds = [
    ...new Set(jobs.map((job) => job.assigned_driver).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
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

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {columns.map((col) => (
              <SelectItem key={col.status} value={col.status}>
                {col.label}
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
              const truck = getTruckById(id);
              return (
                <SelectItem key={id} value={String(id)}>
                  {truck?.registration_number ?? `Truck ${id}`}
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
              const driver = getDriverById(id);
              return (
                <SelectItem key={id} value={String(id)}>
                  {driver?.name ?? `Driver ${id}`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const colJobs = filteredJobs.filter((job) => job.status === col.status);

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
                  const truck = job.assigned_truck
                    ? getTruckById(job.assigned_truck)
                    : null;

                  const driver = job.assigned_driver
                    ? getDriverById(job.assigned_driver)
                    : null;

                  return (
                    <div
                      key={job.job_id}
                      className="rounded-lg border bg-background p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/jobs/${job.job_id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-medium">
                          #{job.job_id}
                        </span>
                        <Badge
                          className={`text-[10px] ${
                            statusBadgeStyles[job.status] ||
                            "bg-secondary text-muted-foreground border-0"
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{job.pickup_location}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{job.delivery_location}</span>
                      </div>

                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {job.cargo_description}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {truck && (
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {truck.registration_number}
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