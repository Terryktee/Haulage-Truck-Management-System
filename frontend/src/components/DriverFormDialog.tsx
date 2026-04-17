import { useState } from "react";
import { useFleet } from "@/context/FleetContext";
import { DriverStatus } from "@/types/fleet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDriverId?: string | null;
}

export function DriverFormDialog({ open, onOpenChange, editDriverId }: DriverFormDialogProps) {
  const { addDriver, updateDriver, getDriverById, drivers } = useFleet();
  const editDriver = editDriverId ? getDriverById(editDriverId) : null;

  const [name, setName] = useState(editDriver?.name ?? "");
  const [license, setLicense] = useState(editDriver?.licenseNumber ?? "");
  const [phone, setPhone] = useState(editDriver?.phone ?? "");
  const [email, setEmail] = useState(editDriver?.email ?? "");
  const [active, setActive] = useState(editDriver?.status === "active" || !editDriver);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const nameTrimmed = name.trim();
    if (!nameTrimmed) errs.name = "Name is required";
    else if (nameTrimmed.split(/\s+/).length < 2) errs.name = "Full name required (at least 2 words)";
    const licenseTrimmed = license.trim();
    if (!licenseTrimmed) errs.license = "License number is required";
    else {
      const existing = drivers.find((d) => d.licenseNumber === licenseTrimmed && d.id !== editDriver?.id);
      if (existing) errs.license = "License number already exists";
    }
    const phoneTrimmed = phone.trim();
    if (!phoneTrimmed) errs.phone = "Phone number is required";
    else if (!/^\+?[\d\s()-]{7,20}$/.test(phoneTrimmed)) errs.phone = "Invalid phone format";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email format";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { name: name.trim(), licenseNumber: license.trim(), phone: phone.trim(), email: email.trim(), status: (active ? "active" : "inactive") as DriverStatus };
    if (editDriver) {
      updateDriver(editDriver.id, data);
    } else {
      addDriver(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{editDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="driverName">Full Name *</Label>
            <Input id="driverName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Smith" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="license">License Number *</Label>
            <Input id="license" value={license} onChange={(e) => setLicense(e.target.value)} placeholder="e.g. SMIT-801234-JS" />
            {errors.license && <p className="text-xs text-destructive mt-1">{errors.license}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 900000" />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="active-toggle">Active Status</Label>
            <Switch id="active-toggle" checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editDriver ? "Save Changes" : "Add Driver"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
