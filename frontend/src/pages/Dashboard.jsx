import { Truck, Users, Package, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { FleetStatusChart } from "@/components/FleetStatusChart";
import { useFleet } from "@/context/FleetContext";

export default function Dashboard() {
  const { trucks, drivers, jobs } = useFleet();

  const availableTrucks = trucks.filter((t) => t.status === "available").length;
  const transitTrucks = trucks.filter((t) => t.status === "in-transit").length;
  const maintenanceTrucks = trucks.filter((t) => t.status === "maintenance").length;
  const activeDrivers = drivers.filter((d) => d.status === "active").length;
  const inactiveDrivers = drivers.filter((d) => d.status === "inactive").length;
  const activeJobs = jobs.filter((j) => j.status === "in-progress").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Fleet overview and operations summary</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trucks"
          value={trucks.length}
          icon={Truck}
          breakdown={[
            { label: "Available", value: availableTrucks, colorClass: "bg-status-available" },
            { label: "In Transit", value: transitTrucks, colorClass: "bg-status-transit" },
            { label: "Maintenance", value: maintenanceTrucks, colorClass: "bg-status-maintenance" },
          ]}
        />
        <StatCard
          title="Total Drivers"
          value={drivers.length}
          icon={Users}
          breakdown={[
            { label: "Active", value: activeDrivers, colorClass: "bg-status-available" },
            { label: "Inactive", value: inactiveDrivers, colorClass: "bg-status-inactive" },
          ]}
        />
        <StatCard
          title="Active Jobs"
          value={activeJobs}
          icon={Package}
          subtitle={`${jobs.filter((j) => j.status === "pending").length} pending`}
        />
        <StatCard
          title="Completed Today"
          value={jobs.filter((j) => j.status === "completed").length}
          icon={Activity}
          subtitle="Last 24 hours"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FleetStatusChart />
        </div>
        <div className="lg:col-span-3">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
