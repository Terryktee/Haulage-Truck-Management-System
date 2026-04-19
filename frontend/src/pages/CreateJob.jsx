import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFleet } from "@/context/FleetContext";
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
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");

  const [errors, setErrors] = useState({});

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
    const errs = {};
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
      truckId: truckId && truckId !== "none" ? truckId : null,
      driverId: driverId && driverId !== "none" ? driverId : null,
      status: "pending",
    });

    toast({ title: "Job created successfully" });
    navigate("/jobs");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Create New Job
          </h1>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Job Details", "Assignment", "Review"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i + 1 < step
                  ? "bg-status-available text-primary-foreground"
                  : i + 1 === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>

            <span
              className={`text-sm hidden sm:block ${
                i + 1 === step ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>

            {i < 2 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Pickup Location *</Label>
              <Input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
              {errors.pickup && (
                <p className="text-xs text-destructive mt-1">
                  {errors.pickup}
                </p>
              )}
            </div>

            <div>
              <Label>Delivery Location *</Label>
              <Input
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
              />
              {errors.delivery && (
                <p className="text-xs text-destructive mt-1">
                  {errors.delivery}
                </p>
              )}
            </div>

            <div>
              <Label>Cargo Description *</Label>
              <Textarea
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
              {errors.cargo && (
                <p className="text-xs text-destructive mt-1">
                  {errors.cargo}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Assign Truck</Label>
              <Select value={truckId} onValueChange={setTruckId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select truck..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {availableTrucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.registration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assign Driver</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {availableDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                  {busyDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id} disabled>
                      {d.name} — busy
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h3 className="font-display font-semibold">Review</h3>
            <p className="text-sm">{pickup} → {delivery}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() =>
              step > 1 ? setStep(step - 1) : navigate("/jobs")
            }
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Create Job</Button>
          )}
        </div>
      </div>
    </div>
  );
}