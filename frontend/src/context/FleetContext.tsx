import React, { createContext, useContext, useState, useCallback } from "react";
import { Truck, Driver, Job, TruckStatus, DriverStatus, JobStatus, JobNote } from "@/types/fleet";
import { initialTrucks, initialDrivers, initialJobs } from "@/data/mockData";

interface FleetContextType {
  trucks: Truck[];
  drivers: Driver[];
  jobs: Job[];
  // Truck CRUD
  addTruck: (truck: Omit<Truck, "id">) => void;
  updateTruck: (id: string, data: Partial<Truck>) => void;
  deleteTruck: (id: string) => boolean;
  // Driver CRUD
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriver: (id: string, data: Partial<Driver>) => void;
  deleteDriver: (id: string) => boolean;
  // Job CRUD
  addJob: (job: Omit<Job, "id" | "createdAt" | "notes">) => void;
  updateJob: (id: string, data: Partial<Job>) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  addJobNote: (jobId: string, text: string) => void;
  deleteJob: (id: string) => boolean;
  // Helpers
  getAvailableTrucks: () => Truck[];
  getAvailableDrivers: () => Driver[];
  getActiveJobsForTruck: (truckId: string) => Job[];
  getActiveJobsForDriver: (driverId: string) => Job[];
  getJobsForTruck: (truckId: string) => Job[];
  getJobsForDriver: (driverId: string) => Job[];
  getTruckById: (id: string) => Truck | undefined;
  getDriverById: (id: string) => Driver | undefined;
  getJobById: (id: string) => Job | undefined;
}

const FleetContext = createContext<FleetContextType | null>(null);

let truckCounter = 13;
let driverCounter = 11;
let jobCounter = 10;

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const addTruck = useCallback((truck: Omit<Truck, "id">) => {
    const id = `TRK-${String(truckCounter++).padStart(3, "0")}`;
    setTrucks((prev) => [...prev, { ...truck, id }]);
  }, []);

  const updateTruck = useCallback((id: string, data: Partial<Truck>) => {
    setTrucks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTruck = useCallback((id: string): boolean => {
    const activeJobs = jobs.filter((j) => j.truckId === id && (j.status === "pending" || j.status === "in-progress"));
    if (activeJobs.length > 0) return false;
    setTrucks((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, [jobs]);

  const addDriver = useCallback((driver: Omit<Driver, "id">) => {
    const id = `DRV-${String(driverCounter++).padStart(3, "0")}`;
    setDrivers((prev) => [...prev, { ...driver, id }]);
  }, []);

  const updateDriver = useCallback((id: string, data: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  }, []);

  const deleteDriver = useCallback((id: string): boolean => {
    const activeJobs = jobs.filter((j) => j.driverId === id && (j.status === "pending" || j.status === "in-progress"));
    if (activeJobs.length > 0) return false;
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    return true;
  }, [jobs]);

  const addJob = useCallback((job: Omit<Job, "id" | "createdAt" | "notes">) => {
    const id = `JOB-${String(jobCounter++).padStart(3, "0")}`;
    setJobs((prev) => [...prev, { ...job, id, createdAt: new Date().toISOString(), notes: [] }]);
    // Update truck status if assigned and job is in-progress
    if (job.truckId && job.status === "in-progress") {
      setTrucks((prev) => prev.map((t) => (t.id === job.truckId ? { ...t, status: "in-transit" as const } : t)));
    }
  }, []);

  const updateJob = useCallback((id: string, data: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
  }, []);

  const updateJobStatus = useCallback((id: string, status: JobStatus) => {
    setJobs((prev) => {
      const job = prev.find((j) => j.id === id);
      if (!job) return prev;

      // When completing or cancelling, free up truck
      if ((status === "completed" || status === "cancelled") && job.truckId) {
        setTrucks((pt) => pt.map((t) => (t.id === job.truckId ? { ...t, status: "available" as const } : t)));
      }
      // When starting, set truck to in-transit
      if (status === "in-progress" && job.truckId) {
        setTrucks((pt) => pt.map((t) => (t.id === job.truckId ? { ...t, status: "in-transit" as const } : t)));
      }

      return prev.map((j) => (j.id === id ? { ...j, status } : j));
    });
  }, []);

  const addJobNote = useCallback((jobId: string, text: string) => {
    const note: JobNote = { id: `n-${Date.now()}`, text, createdAt: new Date().toISOString() };
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, notes: [...j.notes, note] } : j)));
  }, []);

  const deleteJob = useCallback((id: string): boolean => {
    const job = jobs.find((j) => j.id === id);
    if (!job || job.status !== "pending") return false;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    return true;
  }, [jobs]);

  const getAvailableTrucks = useCallback(() => trucks.filter((t) => t.status === "available"), [trucks]);
  const getAvailableDrivers = useCallback(() => {
    const busyDriverIds = new Set(jobs.filter((j) => j.status === "in-progress" || j.status === "pending").map((j) => j.driverId).filter(Boolean));
    return drivers.filter((d) => d.status === "active" && !busyDriverIds.has(d.id));
  }, [drivers, jobs]);

  const getActiveJobsForTruck = useCallback((truckId: string) => jobs.filter((j) => j.truckId === truckId && (j.status === "pending" || j.status === "in-progress")), [jobs]);
  const getActiveJobsForDriver = useCallback((driverId: string) => jobs.filter((j) => j.driverId === driverId && (j.status === "pending" || j.status === "in-progress")), [jobs]);
  const getJobsForTruck = useCallback((truckId: string) => jobs.filter((j) => j.truckId === truckId), [jobs]);
  const getJobsForDriver = useCallback((driverId: string) => jobs.filter((j) => j.driverId === driverId), [jobs]);
  const getTruckById = useCallback((id: string) => trucks.find((t) => t.id === id), [trucks]);
  const getDriverById = useCallback((id: string) => drivers.find((d) => d.id === id), [drivers]);
  const getJobById = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  return (
    <FleetContext.Provider value={{
      trucks, drivers, jobs,
      addTruck, updateTruck, deleteTruck,
      addDriver, updateDriver, deleteDriver,
      addJob, updateJob, updateJobStatus, addJobNote, deleteJob,
      getAvailableTrucks, getAvailableDrivers,
      getActiveJobsForTruck, getActiveJobsForDriver,
      getJobsForTruck, getJobsForDriver,
      getTruckById, getDriverById, getJobById,
    }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}
