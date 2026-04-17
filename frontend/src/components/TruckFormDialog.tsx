import { useState } from "react";
import { useFleet } from "@/context/FleetContext";
import { TruckStatus, TruckType } from "@/types/fleet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const truckTypes: { value: TruckType; label: string }[] = [
  { value: "flatbed", label: "Flatbed" },
  { value: "tanker", label: "Tanker" },
  { value: "refrigerated", label: "Refrigerated" },
  { value: "box", label: "Box" },
  { value: "curtainside", label: "Curtainside" },
  { value: "tipper", label: "Tipper" },
];

const statuses: { value: TruckStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "in-transit", label: "In Transit" },
  { value: "maintenance", label: "Under Maintenance" },
];

interface TruckFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTruckId?: string | null;
}

export function TruckFormDialog({ open, onOpenChange, editTruckId }: TruckFormDialogProps) {
  const { addTruck, updateTruck, getTruckById } = useFleet();
  const editTruck = editTruckId ? getTruckById(editTruckId) : null;

  const [registration, setRegistration] = useState(editTruck?.registration ?? "");
  const [capacity, setCapacity] = useState(editTruck?.capacity?.toString() ?? "");
  const [status, setStatus] = useState<TruckStatus>(editTruck?.status ?? "available");
  const [type, setType] = useState<TruckType>(editTruck?.type ?? "flatbed");
  const [model, setModel] = useState(editTruck?.model ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const regTrimmed = registration.trim();
    if (!regTrimmed) errs.registration = "Registration is required";
    else if (!/^[A-Za-z0-9\s-]+$/.test(regTrimmed)) errs.registration = "Only letters, numbers, spaces and dashes";
    const cap = Number(capacity);
    if (!capacity) errs.capacity = "Capacity is required";
    else if (isNaN(cap) || cap < 1 || cap > 50) errs.capacity = "Must be between 1 and 50 tons";
    if (!model.trim()) errs.model = "Model is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { registration: registration.trim(), capacity: Number(capacity), status, type, model: model.trim(), year: new Date().getFullYear() };
    if (editTruck) {
      updateTruck(editTruck.id, data);
    } else {
      addTruck(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{editTruck ? "Edit Truck" : "Add New Truck"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="registration">Registration Number *</Label>
            <Input id="registration" value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="e.g. AB 1234 CD" />
            {errors.registration && <p className="text-xs text-destructive mt-1">{errors.registration}</p>}
          </div>
          <div>
            <Label htmlFor="capacity">Capacity (tons) *</Label>
            <Input id="capacity" type="number" min={1} max={50} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="1-50" />
            {errors.capacity && <p className="text-xs text-destructive mt-1">{errors.capacity}</p>}
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TruckStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Truck Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TruckType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {truckTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="model">Model *</Label>
            <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Volvo FH16" />
            {errors.model && <p className="text-xs text-destructive mt-1">{errors.model}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTruck ? "Save Changes" : "Add Truck"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
