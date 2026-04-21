import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);

  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [cargo, setCargo] = useState("");

  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");

  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trucksRes, driversRes, jobsRes] = await Promise.all([
        api.get("/trucks/"),
        api.get("/drivers"),
        api.get("/jobs/"),
      ]);

      setTrucks(trucksRes.data);
      setDrivers(driversRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // Available trucks (only available ones)
  const availableTrucks = trucks.filter((t) => t.status === "available");

  // Driver availability = no active job
  const isDriverBusy = (driverId) => {
    return jobs.some(
      (j) =>
        j.assigned_driver === driverId &&
        j.status !== "completed" &&
        j.status !== "cancelled"
    );
  };

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

  const handleSubmit = async () => {
    try {
      await api.post("/jobs/", {
        pickup_location: pickup.trim(),
        delivery_location: delivery.trim(),
        cargo_description: cargo.trim(),
        assigned_truck: truckId && truckId !== "none" ? Number(truckId) : null,
        assigned_driver: driverId && driverId !== "none" ? Number(driverId) : null,
        status: "pending",
      });

      toast({ title: "Job created successfully" });
      navigate("/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive",
      });
    }
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

      {/* Step Content */}
      <div className="rounded-xl border bg-card p-6">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Pickup Location *</Label>
              <Input value={pickup} onChange={(e) => setPickup(e.target.value)} />
              {errors.pickup && <p className="text-xs text-destructive">{errors.pickup}</p>}
            </div>

            <div>
              <Label>Delivery Location *</Label>
              <Input value={delivery} onChange={(e) => setDelivery(e.target.value)} />
              {errors.delivery && <p className="text-xs text-destructive">{errors.delivery}</p>}
            </div>

            <div>
              <Label>Cargo Description *</Label>
              <Textarea value={cargo} onChange={(e) => setCargo(e.target.value)} />
              {errors.cargo && <p className="text-xs text-destructive">{errors.cargo}</p>}
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
                    <SelectItem key={t.truck_id} value={String(t.truck_id)}>
                      {t.registration_number}
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

                  {drivers.map((d) => {
                    const busy = isDriverBusy(d.driver_id);

                    return (
                      <SelectItem
                        key={d.driver_id}
                        value={String(d.driver_id)}
                        disabled={busy}
                      >
                        {d.name} {busy ? "— busy" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h3 className="font-display font-semibold">Review</h3>
            <p className="text-sm">
              {pickup} → {delivery}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/jobs"))}
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