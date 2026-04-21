import { useEffect, useState } from "react";
import { Truck, Users, Package, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { FleetStatusChart } from "@/components/FleetStatusChart";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

export default function Dashboard() {
  const { toast } = useToast();

  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [trucksRes, driversRes, jobsRes] = await Promise.all([
        api.get("/trucks/"),
        api.get("/drivers"),
        api.get("/jobs/"),
      ]);

      setTrucks(trucksRes.data);
      setDrivers(driversRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableTrucks = trucks.filter((t) => t.status === "available").length;
  const transitTrucks = trucks.filter((t) => t.status === "in_transit").length;
  const maintenanceTrucks = trucks.filter((t) => t.status === "maintenance").length;

  // Since driver status does not exist in your API,
  // use total drivers only unless backend adds a status field.
  const totalDrivers = drivers.length;

  const assignedJobs = jobs.filter((j) => j.status === "assigned").length;
  const pendingJobs = jobs.filter((j) => j.status === "pending").length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Fleet overview and operations summary
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      ) : (
        <>
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
              value={totalDrivers}
              icon={Users}
              subtitle="Registered drivers"
            />

            <StatCard
              title="Active Jobs"
              value={assignedJobs}
              icon={Package}
              subtitle={`${pendingJobs} pending`}
            />

            <StatCard
              title="Completed Jobs"
              value={completedJobs}
              icon={Activity}
              subtitle="All completed jobs"
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
        </>
      )}
    </div>
  );
}