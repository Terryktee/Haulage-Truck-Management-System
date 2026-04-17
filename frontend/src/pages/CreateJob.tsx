import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFleet } from "@/context/FleetContext";
import { JobStatus } from "@/types/fleet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, ChevronRight, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addJob, trucks, drivers, getActiveJobsForDriver } = useFleet();
  const [step, setStep] = useState(1);

  // Step 1
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [cargo, setCargo] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Step 2
  const [truckId, setTruckId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableTrucks = trucks.filter((t) => t.status === "available");
  const availableDrivers = drivers.filter((d) => {
    if (d.status !== "active") return false;
    const activeJobs = getActiveJobsForDriver(d.id);
    return activeJobs.length === 0;
  });
  const busyDrivers = drivers.filter((d) => {
    if (d.status !== "active") return false;
    return getActiveJobsForDriver(d.id).length > 0;
  });

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!pickup.trim()) errs.pickup = "Pickup location is required";
    if (!delivery.trim()) errs.delivery = "Delivery location is required";
    if (!cargo.trim()) errs.cargo = "Cargo description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleSubmit = () => {
    addJob({
      pickupLocation: pickup.trim(),
      deliveryLocation: delivery.trim(),
      cargoDescription: cargo.trim(),
      expectedPickup: pickupDate || new Date().toISOString(),
      expectedDelivery: deliveryDate || new Date().toISOString(),
      truckId: truckId || null,
      driverId: driverId || null,
      status: "pending" as JobStatus,
    });
    toast({ title: "Job created successfully" });
    navigate("/jobs");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Create New Job</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Job Details", "Assignment", "Review"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i + 1 < step ? "bg-status-available text-primary-foreground" :
              i + 1 === step ? "bg-primary text-primary-foreground" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i + 1 === step ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Pickup Location *</Label>
              <Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. London Warehouse" />
              {errors.pickup && <p className="text-xs text-destructive mt-1">{errors.pickup}</p>}
            </div>
            <div>
              <Label>Delivery Location *</Label>
              <Input value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="e.g. Manchester Depot" />
              {errors.delivery && <p className="text-xs text-destructive mt-1">{errors.delivery}</p>}
            </div>
            <div>
              <Label>Cargo Description *</Label>
              <Textarea value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Describe the cargo..." rows={3} />
              {errors.cargo && <p className="text-xs text-destructive mt-1">{errors.cargo}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Expected Pickup Date/Time</Label>
                <Input type="datetime-local" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
              </div>
              <div>
                <Label>Expected Delivery Date/Time</Label>
                <Input type="datetime-local" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Assign Truck (optional)</Label>
              <Select value={truckId} onValueChange={setTruckId}>
                <SelectTrigger><SelectValue placeholder="Select a truck..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No truck assigned</SelectItem>
                  {availableTrucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.registration} — {t.capacity}t ({t.type})</SelectItem>
                  ))}
                  {trucks.filter((t) => t.status !== "available").map((t) => (
                    <SelectItem key={t.id} value={t.id} disabled>
                      {t.registration} — {t.status === "in-transit" ? "🚛 In Transit" : "🔧 Maintenance"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {trucks.filter((t) => t.status !== "available").length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Greyed out trucks are unavailable</p>
              )}
            </div>
            <div>
              <Label>Assign Driver (optional)</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger><SelectValue placeholder="Select a driver..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No driver assigned</SelectItem>
                  {availableDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.licenseNumber}</SelectItem>
                  ))}
                  {busyDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id} disabled>
                      {d.name} — ⚠ Has active job
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {busyDrivers.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-status-transit mt-1">
                  <AlertTriangle className="h-3 w-3" /> Some drivers are busy with active jobs
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold">Review Job Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Pickup", value: pickup },
                { label: "Delivery", value: delivery },
                { label: "Cargo", value: cargo },
                { label: "Pickup Date", value: pickupDate ? new Date(pickupDate).toLocaleString() : "Not set" },
                { label: "Delivery Date", value: deliveryDate ? new Date(deliveryDate).toLocaleString() : "Not set" },
                { label: "Truck", value: truckId && truckId !== "none" ? trucks.find((t) => t.id === truckId)?.registration ?? "—" : "Unassigned" },
                { label: "Driver", value: driverId && driverId !== "none" ? drivers.find((d) => d.id === driverId)?.name ?? "—" : "Unassigned" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : navigate("/jobs")}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleSubmit}>Create Job</Button>
          )}
        </div>
      </div>
    </div>
  );
}
