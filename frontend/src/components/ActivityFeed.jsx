import { useEffect, useState } from "react";
import {
  Truck,
  CheckCircle2,
  Wrench,
  PlusCircle,
} from "lucide-react";
import api from "@/api/axios";

const typeConfig = {
  assigned: {
    icon: Truck,
    colorClass: "text-status-transit bg-status-transit-bg",
  },
  completed: {
    icon: CheckCircle2,
    colorClass: "text-status-available bg-status-available-bg",
  },
  cancelled: {
    icon: Wrench,
    colorClass: "text-status-maintenance bg-status-maintenance-bg",
  },
  pending: {
    icon: PlusCircle,
    colorClass: "text-primary bg-primary/10",
  },
};

export function ActivityFeed() {
  const [jobs, setJobs] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);

      const [jobsRes, trucksRes, driversRes] = await Promise.all([
        api.get("/jobs/"),
        api.get("/trucks/"),
        api.get("/drivers"),
      ]);

      setJobs(jobsRes.data);
      setTrucks(trucksRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error("Failed to load activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTruckById = (truckId) => {
    return trucks.find((truck) => truck.truck_id === truckId);
  };

  const getDriverById = (driverId) => {
    return drivers.find((driver) => driver.driver_id === driverId);
  };

  const activities = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10)
    .map((job) => {
      const truck = job.assigned_truck
        ? getTruckById(job.assigned_truck)
        : null;

      const driver = job.assigned_driver
        ? getDriverById(job.assigned_driver)
        : null;

      let message = "";

      switch (job.status) {
        case "assigned":
          message = `${
            truck?.registration_number ?? `Truck ${job.assigned_truck ?? ""}`
          } assigned for ${job.pickup_location} → ${job.delivery_location}`;
          break;

        case "completed":
          message = `Job #${job.job_id} completed: ${job.pickup_location} → ${job.delivery_location}`;
          break;

        case "cancelled":
          message = `Job #${job.job_id} cancelled: ${job.pickup_location} → ${job.delivery_location}`;
          break;

        case "pending":
          message = `New job #${job.job_id}: ${job.pickup_location} → ${job.delivery_location}`;
          break;

        default:
          message = `Job #${job.job_id}: ${job.pickup_location} → ${job.delivery_location}`;
          break;
      }

      if (driver?.name && job.status === "assigned") {
        message += ` • Driver: ${driver.name}`;
      }

      return {
        id: job.job_id,
        message,
        status: job.status,
        created_at: job.created_at,
      };
    });

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h3 className="font-display text-base font-semibold">
          Recent Activity
        </h3>
        <p className="text-xs text-muted-foreground">
          Latest fleet updates
        </p>
      </div>

      <div className="divide-y">
        {loading ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            Loading activity...
          </div>
        ) : activities.length > 0 ? (
          activities.map((item) => {
            const config = typeConfig[item.status] || typeConfig.pending;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className={`mt-0.5 rounded-lg p-1.5 ${config.colorClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{item.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-6 text-sm text-muted-foreground">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}