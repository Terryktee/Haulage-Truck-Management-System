import { useParams, useNavigate } from "react-router-dom";
import { useFleet } from "@/context/FleetContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, MapPin, ArrowRight, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { DriverFormDialog } from "@/components/DriverFormDialog";
import { useToast } from "@/hooks/use-toast";

export default function DriverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getDriverById,
    getJobsForDriver,
    getActiveJobsForDriver,
    deleteDriver,
    getTruckById,
  } = useFleet();
  const [editOpen, setEditOpen] = useState(false);

  const driver = getDriverById(id);
  if (!driver)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Driver not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/drivers")}
        >
          Back to Drivers
        </Button>
      </div>
    );

  const allJobs = getJobsForDriver(driver.id);
  const activeJobs = getActiveJobsForDriver(driver.id);
  const completedJobs = allJobs.filter((j) => j.status === "completed");
  const totalDeliveries = completedJobs.length;

  const handleDelete = () => {
    if (activeJobs.length > 0) {
      toast({
        title: "Cannot delete",
        description: `Driver has ${activeJobs.length} active job(s).`,
        variant: "destructive",
      });
      return;
    }

    if (confirm("Delete this driver permanently?")) {
      deleteDriver(driver.id);
      navigate("/drivers");
      toast({ title: "Driver deleted" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/drivers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {driver.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {driver.id} · {driver.licenseNumber}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-1">
            <Badge
              className={
                driver.status === "active"
                  ? "bg-status-available-bg text-status-available border-0"
                  : "bg-secondary text-status-inactive border-0"
              }
            >
              {driver.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> Phone
          </p>
          <p className="mt-1 font-medium">{driver.phone}</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" /> Email
          </p>
          <p className="mt-1 font-medium">{driver.email || "—"}</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Deliveries</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {totalDeliveries}
          </p>
        </div>
      </div>

      {activeJobs.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h3 className="font-display text-base font-semibold">
              Current Assignment
            </h3>
          </div>

          {activeJobs.map((job) => {
            const truck = job.truckId ? getTruckById(job.truckId) : null;

            return (
              <div
                key={job.id}
                className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary/30"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div>
                  <span className="font-medium">{job.id}</span>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" /> {job.pickupLocation}
                    <ArrowRight className="h-3 w-3" /> {job.deliveryLocation}
                  </div>
                </div>

                <div className="text-right text-sm">
                  <Badge variant="outline">{job.status}</Badge>
                  {truck && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {truck.registration}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-base font-semibold">Job History</h3>
          <p className="text-xs text-muted-foreground">{allJobs.length} total jobs</p>
        </div>

        <div className="divide-y">
          {allJobs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No jobs yet
            </p>
          )}

          {allJobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div>
                <span className="font-medium">{job.id}</span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" /> {job.pickupLocation}
                  <ArrowRight className="h-3 w-3" /> {job.deliveryLocation}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {job.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <DriverFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editDriverId={driver.id}
      />
    </div>
  );
}