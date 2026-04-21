import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";
import { TruckFormDialog } from "@/components/TruckFormDialog";

const statusStyles = {
  available: "bg-status-available-bg text-status-available border-0",
  in_transit: "bg-status-transit-bg text-status-transit border-0",
  maintenance: "bg-status-maintenance-bg text-status-maintenance border-0",
};

const statusLabels = {
  available: "Available",
  in_transit: "In Transit",
  maintenance: "Maintenance",
};

export default function TruckDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [truck, setTruck] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [trucksRes, jobsRes, driversRes] = await Promise.all([
        api.get("/trucks/"),
        api.get("/jobs/"),
        api.get("/drivers"),
      ]);

      const foundTruck = trucksRes.data.find(
        (t) => String(t.truck_id) === String(id)
      );

      setTruck(foundTruck || null);
      setJobs(jobsRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error("Failed to load truck:", error);
      toast({
        title: "Error",
        description: "Failed to load truck",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDriverById = (driverId) => {
    return drivers.find((driver) => driver.driver_id === driverId);
  };

  const truckJobs = truck
    ? jobs.filter((job) => job.assigned_truck === truck.truck_id)
    : [];

  const activeJobs = truckJobs.filter(
    (job) => job.status !== "completed" && job.status !== "cancelled"
  );

  const handleDelete = async () => {
    if (activeJobs.length > 0) {
      toast({
        title: "Cannot delete",
        description: `Truck has ${activeJobs.length} active job(s).`,
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Delete this truck permanently?")) return;

    try {
      await api.delete(`/trucks/${truck.truck_id}`);
      toast({ title: "Truck deleted" });
      navigate("/trucks");
    } catch (error) {
      console.error("Failed to delete truck:", error);
      toast({
        title: "Error",
        description: "Failed to delete truck.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading truck...</p>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Truck not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/trucks")}
        >
          Back to Trucks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/trucks")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              #{truck.truck_id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {truck.registration_number}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-1">
            <Badge
              className={
                statusStyles[truck.status] ||
                "bg-secondary text-muted-foreground border-0"
              }
            >
              {statusLabels[truck.status] || truck.status}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Capacity</p>
          <div className="mt-1 font-medium">{truck.capacity}</div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Created</p>
          <div className="mt-1 font-medium">
            {new Date(truck.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {activeJobs.length > 0 && (
        <div className="rounded-lg border border-status-transit/30 bg-status-transit-bg p-4">
          <p className="text-sm font-medium text-status-transit">
            ⚠ This truck has {activeJobs.length} active job(s) — it cannot be
            deleted until jobs are completed or cancelled.
          </p>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-base font-semibold">Job History</h3>
          <p className="text-xs text-muted-foreground">
            {truckJobs.length} total jobs
          </p>
        </div>

        <div className="divide-y">
          {truckJobs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No jobs assigned yet
            </p>
          )}

          {truckJobs.map((job) => {
            const driver = job.assigned_driver
              ? getDriverById(job.assigned_driver)
              : null;

            return (
              <div
                key={job.job_id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/jobs/${job.job_id}`)}
              >
                <div>
                  <span className="font-medium">#{job.job_id}</span>
                  <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {job.pickup_location}
                    <ArrowRight className="h-3 w-3" />
                    {job.delivery_location}
                  </div>
                </div>

                <div className="text-right text-sm">
                  <Badge variant="outline" className="text-xs">
                    {job.status}
                  </Badge>
                  {driver && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {driver.name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TruckFormDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            fetchData();
          }
        }}
        editTruckId={truck.truck_id}
      />
    </div>
  );
}