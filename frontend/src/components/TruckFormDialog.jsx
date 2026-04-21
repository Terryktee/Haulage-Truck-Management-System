import { useEffect, useState } from "react";
import { useFleet } from "@/context/FleetContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = [
  { value: "available", label: "Available" },
  { value: "in_transit", label: "In Transit" },
  { value: "maintenance", label: "Under Maintenance" },
];

export function TruckFormDialog({ open, onOpenChange, editTruckId }) {
  const { addTruck, updateTruck, getTruckById, trucks } = useFleet();

  const editTruck = editTruckId ? getTruckById(editTruckId) : null;

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("available");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editTruck) {
      setRegistrationNumber(editTruck.registration_number || "");
      setCapacity(editTruck.capacity?.toString() || "");
      setStatus(editTruck.status || "available");
    } else {
      setRegistrationNumber("");
      setCapacity("");
      setStatus("available");
    }

    setErrors({});
  }, [editTruck, open]);

  const validate = () => {
    const errs = {};
    const regTrimmed = registrationNumber.trim();
    const cap = Number(capacity);

    if (!regTrimmed) {
      errs.registration_number = "Registration number is required";
    } else if (!/^[A-Za-z0-9\s-]+$/.test(regTrimmed)) {
      errs.registration_number =
        "Only letters, numbers, spaces and dashes are allowed";
    } else {
      const existingTruck = trucks.find(
        (truck) =>
          truck.registration_number === regTrimmed &&
          truck.truck_id !== editTruck?.truck_id
      );

      if (existingTruck) {
        errs.registration_number = "Registration number already exists";
      }
    }

    if (!capacity) {
      errs.capacity = "Capacity is required";
    } else if (isNaN(cap) || cap <= 0) {
      errs.capacity = "Capacity must be a valid number greater than 0";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      registration_number: registrationNumber.trim(),
      capacity: capacity.trim(),
      status,
    };

    try {
      setSubmitting(true);

      if (editTruck) {
        await updateTruck(editTruck.truck_id, payload);
      } else {
        await addTruck(payload);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save truck:", error);

      if (error.response?.data) {
        const apiErrors = {};

        if (error.response.data.registration_number) {
          apiErrors.registration_number = Array.isArray(
            error.response.data.registration_number
          )
            ? error.response.data.registration_number[0]
            : error.response.data.registration_number;
        }

        if (error.response.data.capacity) {
          apiErrors.capacity = Array.isArray(error.response.data.capacity)
            ? error.response.data.capacity[0]
            : error.response.data.capacity;
        }

        if (error.response.data.status) {
          apiErrors.status = Array.isArray(error.response.data.status)
            ? error.response.data.status[0]
            : error.response.data.status;
        }

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          return;
        }
      }

      setErrors({
        general: "Failed to save truck. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editTruck ? "Edit Truck" : "Add New Truck"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {errors.general && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {errors.general}
            </p>
          )}

          <div>
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. N02349220"
              disabled={submitting}
            />
            {errors.registration_number && (
              <p className="mt-1 text-xs text-destructive">
                {errors.registration_number}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="capacity">Capacity *</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              step="0.01"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 400.00"
              disabled={submitting}
            />
            {errors.capacity && (
              <p className="mt-1 text-xs text-destructive">
                {errors.capacity}
              </p>
            )}
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select truck status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="mt-1 text-xs text-destructive">
                {errors.status}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "Saving..."
                : editTruck
                ? "Save Changes"
                : "Add Truck"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}