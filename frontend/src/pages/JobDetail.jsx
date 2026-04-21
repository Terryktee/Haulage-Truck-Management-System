import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trash2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const statusStyles = {
  pending: "bg-secondary text-muted-foreground",
  assigned: "bg-status-transit-bg text-status-transit",
  completed: "bg-status-available-bg text-status-available",
  cancelled: "bg-status-maintenance-bg text-status-maintenance",
};

const activeStatuses = ["pending", "assigned", "in_progress", "in-progress"];

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [truck, setTruck] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const loadTruckById = async (truckId) => {
    if (!truckId) {
      setTruck(null);
      return;
    }

    try {
      const truckRes = await api.get(`/trucks/${truckId}/`);
      setTruck(truckRes.data);
    } catch (error) {
      console.error("Failed to load truck:", error);
      setTruck(null);
    }
  };

  const loadDriverById = async (driverId) => {
    if (!driverId) {
      setDriver(null);
      return;
    }

    try {
      const driverRes = await api.get(`/drivers/${driverId}/`);
      setDriver(driverRes.data);
    } catch (error) {
      console.error("Failed to load driver:", error);
      setDriver(null);
    }
  };

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setTruck(null);
      setDriver(null);

      const jobRes = await api.get(`/jobs/${id}/`);
      const jobData = jobRes.data;
      setJob(jobData);

      if (jobData.assigned_truck) {
        await loadTruckById(jobData.assigned_truck);
      }

      if (jobData.assigned_driver) {
        await loadDriverById(jobData.assigned_driver);
      }
    } catch (error) {
      console.error("Failed to load job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details.",
        variant: "destructive",
      });
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const openAssignDialog = async () => {
    try {
      setAssignLoading(true);

      const [trucksRes, driversRes, jobsRes] = await Promise.all([
        api.get("/trucks/"),
        api.get("/drivers/"),
        api.get("/jobs/"),
      ]);

      const trucks = Array.isArray(trucksRes.data) ? trucksRes.data : [];
      const drivers = Array.isArray(driversRes.data) ? driversRes.data : [];
      const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];

      const busyTruckIds = new Set(
        jobs
          .filter(
            (item) =>
              item.job_id !== job?.job_id &&
              activeStatuses.includes(item.status) &&
              item.assigned_truck
          )
          .map((item) => String(item.assigned_truck))
      );

      const busyDriverIds = new Set(
        jobs
          .filter(
            (item) =>
              item.job_id !== job?.job_id &&
              activeStatuses.includes(item.status) &&
              item.assigned_driver
          )
          .map((item) => String(item.assigned_driver))
      );

      const filteredTrucks = trucks.filter(
        (item) =>
          (
            item.status === "available" &&
            !busyTruckIds.has(String(item.truck_id))
          ) ||
          String(item.truck_id) === String(job?.assigned_truck)
      );

      const filteredDrivers = drivers.filter(
        (item) =>
          !busyDriverIds.has(String(item.driver_id)) ||
          String(item.driver_id) === String(job?.assigned_driver)
      );

      setAvailableTrucks(filteredTrucks);
      setAvailableDrivers(filteredDrivers);

      setSelectedTruckId(
        job?.assigned_truck ? String(job.assigned_truck) : ""
      );
      setSelectedDriverId(
        job?.assigned_driver ? String(job.assigned_driver) : ""
      );

      setAssignDialogOpen(true);
    } catch (error) {
      console.error("Failed to load assignment options:", error);
      toast({
        title: "Error",
        description: "Failed to load available trucks and drivers.",
        variant: "destructive",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!job) return;

    if (!selectedTruckId || !selectedDriverId) {
      toast({
        title: "Missing selection",
        description: "Please select both a truck and a driver.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAssignLoading(true);

      const response = await api.patch(`/jobs/${job.job_id}/`, {
        assigned_truck: Number(selectedTruckId),
        assigned_driver: Number(selectedDriverId),
        status: "assigned",
      });

      const updatedJob = response.data;
      setJob(updatedJob);

      await Promise.all([
        loadTruckById(updatedJob.assigned_truck),
        loadDriverById(updatedJob.assigned_driver),
      ]);

      setAssignDialogOpen(false);

      toast({
        title: "Success",
        description: "Job assigned successfully.",
      });
    } catch (error) {
      console.error("Assignment failed:", error);
      toast({
        title: "Error",
        description: "Failed to assign truck and driver to this job.",
        variant: "destructive",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignClick = async () => {
    if (!job) return;

    if (!job.assigned_truck || !job.assigned_driver) {
      await openAssignDialog();
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.patch(`/jobs/${job.job_id}/`, {
        status: "assigned",
      });

      setJob(response.data);

      toast({
        title: "Success",
        description: "Job status updated to assigned.",
      });
    } catch (error) {
      console.error("Status update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!job) return;

    if (newStatus === "assigned") {
      await handleAssignClick();
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.patch(`/jobs/${job.job_id}/`, {
        status: newStatus,
      });

      const updatedJob = response.data;
      setJob(updatedJob);

      if (updatedJob.assigned_truck) {
        await loadTruckById(updatedJob.assigned_truck);
      } else {
        setTruck(null);
      }

      if (updatedJob.assigned_driver) {
        await loadDriverById(updatedJob.assigned_driver);
      } else {
        setDriver(null);
      }

      toast({
        title: "Success",
        description: `Job status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Status update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    if (job.status !== "pending") {
      toast({
        title: "Cannot delete",
        description: "Only pending jobs can be deleted.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Delete this job?");
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await api.delete(`/jobs/${job.job_id}/`);

      toast({
        title: "Job deleted",
        description: "The job was deleted successfully.",
      });

      navigate("/jobs");
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading...</p>;
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Job not found.</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/jobs")}
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/jobs")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="text-2xl font-bold">Job #{job.job_id}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{job.pickup_location}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{job.delivery_location}</span>
              </div>
            </div>
          </div>

          <Badge className={statusStyles[job.status] || ""}>
            {job.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => updateStatus("assigned")}
            disabled={actionLoading || assignLoading || job.status === "assigned"}
          >
            Assign
          </Button>

          <Button
            onClick={() => updateStatus("completed")}
            disabled={actionLoading || job.status === "completed"}
          >
            Complete
          </Button>

          <Button
            onClick={() => updateStatus("cancelled")}
            disabled={actionLoading || job.status === "cancelled"}
          >
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={openAssignDialog}
            disabled={assignLoading}
          >
            Edit Assignment
          </Button>

          {job.status === "pending" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>

        <div className="rounded-xl border p-5 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Cargo Description</p>
            <p className="font-medium">{job.cargo_description || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Pickup Location</p>
            <p className="font-medium">{job.pickup_location || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Delivery Location</p>
            <p className="font-medium">{job.delivery_location || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Assigned Truck</p>
            <p className="font-medium">
              {truck ? truck.registration_number : "Unassigned"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Assigned Driver</p>
            <p className="font-medium">
              {driver ? driver.name : "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Truck and Driver</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Truck</Label>
              <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a truck" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrucks.length > 0 ? (
                    availableTrucks.map((item) => (
                      <SelectItem
                        key={item.truck_id}
                        value={String(item.truck_id)}
                      >
                        {item.registration_number}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No available trucks
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Driver</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length > 0 ? (
                    availableDrivers.map((item) => (
                      <SelectItem
                        key={item.driver_id}
                        value={String(item.driver_id)}
                      >
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No available drivers
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={assignLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignLoading}>
              {assignLoading ? "Saving..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}