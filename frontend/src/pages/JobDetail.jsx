import { useParams, useNavigate } from "react-router-dom";
import { useFleet } from "@/context/FleetContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Trash2,
  MapPin,
  ArrowRight,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const statusBadgeStyles = {
  pending: "bg-secondary text-muted-foreground border-0",
  "in-progress": "bg-status-transit-bg text-status-transit border-0",
  completed: "bg-status-available-bg text-status-available border-0",
  cancelled: "bg-status-maintenance-bg text-status-maintenance border-0",
};

const timelineSteps = [
  { status: "pending", label: "Created", icon: Clock },
  { status: "in-progress", label: "In Transit", icon: Send },
  { status: "completed", label: "Delivered", icon: CheckCircle2 },
];

const statusOrder = {
  pending: 0,
  "in-progress": 1,
  completed: 2,
  cancelled: -1,
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    getJobById,
    getTruckById,
    getDriverById,
    updateJobStatus,
    deleteJob,
    addJobNote,
    updateJob,
    getAvailableTrucks,
    getAvailableDrivers,
  } = useFleet();

  const [noteText, setNoteText] = useState("");

  const job = getJobById(id);
  if (!job)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/jobs")}>
          Back to Jobs
        </Button>
      </div>
    );

  const truck = job.truckId ? getTruckById(job.truckId) : null;
  const driver = job.driverId ? getDriverById(job.driverId) : null;
  const currentOrder = statusOrder[job.status];

  const handleStatusChange = (newStatus) => {
    updateJobStatus(job.id, newStatus);
    toast({ title: `Job status updated to ${newStatus}` });
  };

  const handleDelete = () => {
    if (job.status !== "pending") {
      toast({
        title: "Cannot delete",
        description: "Only pending jobs can be deleted.",
        variant: "destructive",
      });
      return;
    }
    if (confirm("Delete this job?")) {
      deleteJob(job.id);
      navigate("/jobs");
      toast({ title: "Job deleted" });
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addJobNote(job.id, noteText.trim());
    setNoteText("");
    toast({ title: "Note added" });
  };

  const handleReassignTruck = (newTruckId) => {
    updateJob(job.id, { truckId: newTruckId === "none" ? null : newTruckId });
    toast({ title: "Truck reassigned" });
  };

  const handleReassignDriver = (newDriverId) => {
    updateJob(job.id, { driverId: newDriverId === "none" ? null : newDriverId });
    toast({ title: "Driver reassigned" });
  };

  const canReassign = job.status !== "completed" && job.status !== "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {job.id}
              </h1>
              <Badge className={statusBadgeStyles[job.status]}>
                {job.status}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {job.pickupLocation}
              <ArrowRight className="h-3.5 w-3.5" /> {job.deliveryLocation}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Select onValueChange={handleStatusChange} value={job.status}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {job.status === "pending" && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-sm font-semibold mb-4">
          Status Timeline
        </h3>

        <div className="flex items-center gap-0">
          {timelineSteps.map((s, i) => {
            const order = statusOrder[s.status];
            const isActive =
              job.status === "cancelled" ? false : currentOrder >= order;
            const Icon = s.icon;

            return (
              <div key={s.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`mt-1.5 text-xs ${
                      isActive ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {i < timelineSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentOrder > order ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            );
          })}

          {job.status === "cancelled" && (
            <div className="flex flex-col items-center ml-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-maintenance text-primary-foreground">
                <XCircle className="h-5 w-5" />
              </div>
              <span className="mt-1.5 text-xs font-medium text-status-maintenance">
                Cancelled
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-display text-sm font-semibold">
            Notes & Comments
          </h3>
        </div>

        <div className="p-5 space-y-3">
          {job.notes.length === 0 && (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          )}

          {job.notes.map((note) => (
            <div key={note.id} className="rounded-lg bg-secondary p-3">
              <p className="text-sm">{note.text}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              onKeyDown={(e) =>
                e.key === "Enter" && handleAddNote()
              }
            />
            <Button size="icon" onClick={handleAddNote}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}