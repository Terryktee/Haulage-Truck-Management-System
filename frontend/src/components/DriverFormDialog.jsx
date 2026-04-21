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

export function DriverFormDialog({ open, onOpenChange, editDriverId }) {
  const { addDriver, updateDriver, getDriverById, drivers } = useFleet();

  const editDriver = editDriverId ? getDriverById(editDriverId) : null;

  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editDriver) {
      setName(editDriver.name || "");
      setLicenseNumber(editDriver.license_number || "");
      setPhoneNumber(editDriver.phone_number || "");
    } else {
      setName("");
      setLicenseNumber("");
      setPhoneNumber("");
    }

    setErrors({});
  }, [editDriver, open]);

  const validate = () => {
    const errs = {};

    const trimmedName = name.trim();
    const trimmedLicense = licenseNumber.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName) {
      errs.name = "Name is required";
    } else if (trimmedName.split(/\s+/).length < 2) {
      errs.name = "Full name required (at least 2 words)";
    }

    if (!trimmedLicense) {
      errs.license_number = "License number is required";
    } else {
      const existingDriver = drivers.find(
        (driver) =>
          driver.license_number === trimmedLicense &&
          driver.driver_id !== editDriver?.driver_id
      );

      if (existingDriver) {
        errs.license_number = "License number already exists";
      }
    }

    if (!trimmedPhone) {
      errs.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s()-]{7,20}$/.test(trimmedPhone)) {
      errs.phone_number = "Invalid phone format";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      license_number: licenseNumber.trim(),
      phone_number: phoneNumber.trim(),
    };

    try {
      setSubmitting(true);

      if (editDriver) {
        await updateDriver(editDriver.driver_id, payload);
      } else {
        await addDriver(payload);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save driver:", error);

      if (error.response?.data) {
        const apiErrors = {};

        if (error.response.data.name) {
          apiErrors.name = Array.isArray(error.response.data.name)
            ? error.response.data.name[0]
            : error.response.data.name;
        }

        if (error.response.data.license_number) {
          apiErrors.license_number = Array.isArray(error.response.data.license_number)
            ? error.response.data.license_number[0]
            : error.response.data.license_number;
        }

        if (error.response.data.phone_number) {
          apiErrors.phone_number = Array.isArray(error.response.data.phone_number)
            ? error.response.data.phone_number[0]
            : error.response.data.phone_number;
        }

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          return;
        }
      }

      setErrors({
        general: "Failed to save driver. Please try again.",
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
            {editDriver ? "Edit Driver" : "Add New Driver"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {errors.general && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {errors.general}
            </p>
          )}

          <div>
            <Label htmlFor="driverName">Full Name *</Label>
            <Input
              id="driverName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tawanda Kapumha"
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. 738-ABC"
              disabled={submitting}
            />
            {errors.license_number && (
              <p className="mt-1 text-xs text-destructive">
                {errors.license_number}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 45787981209"
              disabled={submitting}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-destructive">
                {errors.phone_number}
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
                : editDriver
                ? "Save Changes"
                : "Add Driver"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}