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
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";
import { DriverFormDialog } from "@/components/DriverFormDialog";

export default function DriverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [driver, setDriver] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [driversRes, jobsRes, trucksRes] = await Promise.all([
        api.get("/drivers"),
        api.get("/jobs/"),
        api.get("/trucks/"),
      ]);

      const foundDriver = driversRes.data.find(
        (d) => String(d.driver_id) === String(id)
      );

      setDriver(foundDriver || null);
      setJobs(jobsRes.data);
      setTrucks(trucksRes.data);
    } catch (error) {
      console.error("Failed to load driver:", error);
      toast({
        title: "Error",
        description: "Failed to load driver",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground p-6">Loading...</p>;
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Driver not found</p>
        <Button variant="outline" onClick={() => navigate("/drivers")}>
          Back to Drivers
        </Button>
      </div>
    );
  }

  const getTruckById = (id) =>
    trucks.find((t) => t.truck_id === id);

  const allJobs = jobs.filter(
    (j) => j.assigned_driver === driver.driver_id
  );

  const activeJobs = allJobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled"
  );

  const completedJobs = allJobs.filter(
    (j) => j.status === "completed"
  );

  const handleDelete = async () => {
    if (activeJobs.length > 0) {
      toast({
        title: "Cannot delete",
        description: `Driver has ${activeJobs.length} active job(s).`,
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Delete this driver permanently?")) return;

    try {
      await api.delete(`/drivers/${driver.driver_id}`);
      navigate("/drivers");
      toast({ title: "Driver deleted" });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/drivers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold">{driver.name}</h1>
            <p className="text-sm text-muted-foreground">
              #{driver.driver_id} · {driver.license_number}
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

      {/* Info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Phone</p>
          <p className="mt-1 font-medium flex items-center gap-2">
            <Phone className="h-3 w-3" /> {driver.phone_number}
          </p>
        </div>

        <div className="border p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Total Deliveries</p>
          <p className="text-2xl font-bold">{completedJobs.length}</p>
        </div>

        <div className="border p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Active Jobs</p>
          <p className="text-2xl font-bold">{activeJobs.length}</p>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="border rounded-xl">
          <div className="p-4 border-b font-semibold">Current Assignment</div>

          {activeJobs.map((job) => {
            const truck = getTruckById(job.assigned_truck);

            return (
              <div
                key={job.job_id}
                className="p-4 hover:bg-secondary/30 cursor-pointer"
                onClick={() => navigate(`/jobs/${job.job_id}`)}
              >
                <p className="font-medium">#{job.job_id}</p>
                <p className="text-sm text-muted-foreground">
                  {job.pickup_location} → {job.delivery_location}
                </p>

                <div className="flex justify-between mt-2">
                  <Badge>{job.status}</Badge>
                  {truck && (
                    <span className="text-xs text-muted-foreground">
                      {truck.registration_number}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      <div className="border rounded-xl">
        <div className="p-4 border-b font-semibold">
          Job History ({allJobs.length})
        </div>

        {allJobs.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No jobs yet
          </p>
        ) : (
          allJobs.map((job) => (
            <div
              key={job.job_id}
              className="p-4 hover:bg-secondary/30 cursor-pointer"
              onClick={() => navigate(`/jobs/${job.job_id}`)}
            >
              <p className="font-medium">#{job.job_id}</p>
              <p className="text-sm text-muted-foreground">
                {job.pickup_location} → {job.delivery_location}
              </p>
              <Badge className="mt-2">{job.status}</Badge>
            </div>
          ))
        )}
      </div>

      <DriverFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editDriverId={driver.driver_id}
      />
    </div>
  );
}