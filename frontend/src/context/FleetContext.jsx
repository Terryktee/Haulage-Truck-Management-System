import React, { createContext, useContext, useState, useCallback } from "react";
import { initialTrucks, initialDrivers, initialJobs } from "@/data/mockData";

const FleetContext = createContext(null);

let truckCounter = 13;
let driverCounter = 11;
let jobCounter = 10;

export function FleetProvider({ children }) {
  const [trucks, setTrucks] = useState(initialTrucks);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [jobs, setJobs] = useState(initialJobs);

  const addTruck = useCallback((truck) => {
    const id = `TRK-${String(truckCounter++).padStart(3, "0")}`;
    setTrucks((prev) => [...prev, { ...truck, id }]);
  }, []);

  const updateTruck = useCallback((id, data) => {
    setTrucks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTruck = useCallback(
    (id) => {
      const activeJobs = jobs.filter(
        (j) => j.truckId === id && (j.status === "pending" || j.status === "in-progress")
      );
      if (activeJobs.length > 0) return false;
      setTrucks((prev) => prev.filter((t) => t.id !== id));
      return true;
    },
    [jobs]
  );

  const addDriver = useCallback((driver) => {
    const id = `DRV-${String(driverCounter++).padStart(3, "0")}`;
    setDrivers((prev) => [...prev, { ...driver, id }]);
  }, []);

  const updateDriver = useCallback((id, data) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  }, []);

  const deleteDriver = useCallback(
    (id) => {
      const activeJobs = jobs.filter(
        (j) => j.driverId === id && (j.status === "pending" || j.status === "in-progress")
      );
      if (activeJobs.length > 0) return false;
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      return true;
    },
    [jobs]
  );

  const addJob = useCallback((job) => {
    const id = `JOB-${String(jobCounter++).padStart(3, "0")}`;
    setJobs((prev) => [
      ...prev,
      { ...job, id, createdAt: new Date().toISOString(), notes: [] },
    ]);

    if (job.truckId && job.status === "in-progress") {
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === job.truckId ? { ...t, status: "in-transit" } : t
        )
      );
    }
  }, []);

  const updateJob = useCallback((id, data) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
  }, []);

  const updateJobStatus = useCallback((id, status) => {
    setJobs((prev) => {
      const job = prev.find((j) => j.id === id);
      if (!job) return prev;

      if ((status === "completed" || status === "cancelled") && job.truckId) {
        setTrucks((pt) =>
          pt.map((t) =>
            t.id === job.truckId ? { ...t, status: "available" } : t
          )
        );
      }

      if (status === "in-progress" && job.truckId) {
        setTrucks((pt) =>
          pt.map((t) =>
            t.id === job.truckId ? { ...t, status: "in-transit" } : t
          )
        );
      }

      return prev.map((j) => (j.id === id ? { ...j, status } : j));
    });
  }, []);

  const addJobNote = useCallback((jobId, text) => {
    const note = {
      id: `n-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, notes: [...j.notes, note] } : j
      )
    );
  }, []);

  const deleteJob = useCallback(
    (id) => {
      const job = jobs.find((j) => j.id === id);
      if (!job || job.status !== "pending") return false;
      setJobs((prev) => prev.filter((j) => j.id !== id));
      return true;
    },
    [jobs]
  );

  const getAvailableTrucks = useCallback(
    () => trucks.filter((t) => t.status === "available"),
    [trucks]
  );

  const getAvailableDrivers = useCallback(() => {
    const busyDriverIds = new Set(
      jobs
        .filter((j) => j.status === "in-progress" || j.status === "pending")
        .map((j) => j.driverId)
        .filter(Boolean)
    );

    return drivers.filter(
      (d) => d.status === "active" && !busyDriverIds.has(d.id)
    );
  }, [drivers, jobs]);

  const getActiveJobsForTruck = useCallback(
    (truckId) =>
      jobs.filter(
        (j) =>
          j.truckId === truckId &&
          (j.status === "pending" || j.status === "in-progress")
      ),
    [jobs]
  );

  const getActiveJobsForDriver = useCallback(
    (driverId) =>
      jobs.filter(
        (j) =>
          j.driverId === driverId &&
          (j.status === "pending" || j.status === "in-progress")
      ),
    [jobs]
  );

  const getJobsForTruck = useCallback(
    (truckId) => jobs.filter((j) => j.truckId === truckId),
    [jobs]
  );

  const getJobsForDriver = useCallback(
    (driverId) => jobs.filter((j) => j.driverId === driverId),
    [jobs]
  );

  const getTruckById = useCallback(
    (id) => trucks.find((t) => t.id === id),
    [trucks]
  );

  const getDriverById = useCallback(
    (id) => drivers.find((d) => d.id === id),
    [drivers]
  );

  const getJobById = useCallback(
    (id) => jobs.find((j) => j.id === id),
    [jobs]
  );

  return (
    <FleetContext.Provider
      value={{
        trucks,
        drivers,
        jobs,
        addTruck,
        updateTruck,
        deleteTruck,
        addDriver,
        updateDriver,
        deleteDriver,
        addJob,
        updateJob,
        updateJobStatus,
        addJobNote,
        deleteJob,
        getAvailableTrucks,
        getAvailableDrivers,
        getActiveJobsForTruck,
        getActiveJobsForDriver,
        getJobsForTruck,
        getJobsForDriver,
        getTruckById,
        getDriverById,
        getJobById,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}