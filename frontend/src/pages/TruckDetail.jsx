import { useParams, useNavigate } from "react-router-dom";
import { useFleet } from "@/context/FleetContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { TruckFormDialog } from "@/components/TruckFormDialog";
import { useToast } from "@/hooks/use-toast";

const statusStyles = {
  available: "bg-status-available-bg text-status-available border-0",
  "in-transit": "bg-status-transit-bg text-status-transit border-0",
  maintenance: "bg-status-maintenance-bg text-status-maintenance border-0",
};

const statusLabels = {
  available: "Available",
  "in-transit": "In Transit",
  maintenance: "Maintenance",
};

export default function TruckDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    getTruckById,
    getJobsForTruck,
    getActiveJobsForTruck,
    deleteTruck,
    getDriverById,
  } = useFleet();

  const [editOpen, setEditOpen] = useState(false);

  const truck = getTruckById(id);

  if (!truck)
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

  const allJobs = getJobsForTruck(truck.id);
  const activeJobs = getActiveJobsForTruck(truck.id);

  const handleDelete = () => {
    if (activeJobs.length > 0) {
      toast({
        title: "Cannot delete",
        description: `Truck has ${activeJobs.length} active job(s).`,
        variant: "destructive",
      });
      return;
    }

    if (confirm("Delete this truck permanently?")) {
      deleteTruck(truck.id);
      navigate("/trucks");
      toast({ title: "Truck deleted" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              {truck.id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {truck.registration} · {truck.model}
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

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Status",
            value: (
              <Badge className={statusStyles[truck.status]}>
                {statusLabels[truck.status]}
              </Badge>
            ),
          },
          { label: "Capacity", value: `${truck.capacity} tons` },
          {
            label: "Type",
            value:
              truck.type.charAt(0).toUpperCase() + truck.type.slice(1),
          },
          { label: "Year", value: truck.year },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <div className="mt-1 font-medium">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Active Jobs Warning */}
      {activeJobs.length > 0 && (
        <div className="rounded-lg border border-status-transit/30 bg-status-transit-bg p-4">
          <p className="text-sm font-medium text-status-transit">
            ⚠ This truck has {activeJobs.length} active job(s) — it cannot be
            deleted until jobs are completed or cancelled.
          </p>
        </div>
      )}

      {/* Job History */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-base font-semibold">
            Job History
          </h3>
          <p className="text-xs text-muted-foreground">
            {allJobs.length} total jobs
          </p>
        </div>

        <div className="divide-y">
          {allJobs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No jobs assigned yet
            </p>
          )}

          {allJobs.map((job) => {
            const driver = job.driverId
              ? getDriverById(job.driverId)
              : null;

            return (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div>
                  <span className="font-medium">{job.id}</span>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {job.pickupLocation}
                    <ArrowRight className="h-3 w-3" />
                    {job.deliveryLocation}
                  </div>
                </div>

                <div className="text-right text-sm">
                  <Badge variant="outline" className="text-xs">
                    {job.status}
                  </Badge>
                  {driver && (
                    <p className="text-xs text-muted-foreground mt-0.5">
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
        onOpenChange={setEditOpen}
        editTruckId={truck.id}
      />
    </div>
  );
}