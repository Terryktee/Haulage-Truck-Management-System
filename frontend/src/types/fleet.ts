export type TruckStatus = "available" | "in-transit" | "maintenance";
export type TruckType = "flatbed" | "tanker" | "refrigerated" | "box" | "curtainside" | "tipper";
export type DriverStatus = "active" | "inactive";
export type JobStatus = "pending" | "in-progress" | "completed" | "cancelled";

export interface Truck {
  id: string;
  registration: string;
  capacity: number;
  status: TruckStatus;
  type: TruckType;
  model: string;
  year: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  status: DriverStatus;
}

export interface JobNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Job {
  id: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoDescription: string;
  expectedPickup: string;
  expectedDelivery: string;
  truckId: string | null;
  driverId: string | null;
  status: JobStatus;
  createdAt: string;
  notes: JobNote[];
}
