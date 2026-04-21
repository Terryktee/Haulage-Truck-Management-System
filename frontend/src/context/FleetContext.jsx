import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { initialJobs } from "@/data/mockData";

const FleetContext = createContext(null);

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


export function FleetProvider({ children }) {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);

  const fetchTrucks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/trucks/");
      setTrucks(response.data);
    } catch (error) {
      console.error("Failed to fetch trucks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await api.get("/drivers/");
      setDrivers(response.data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    }
  }, []);

  useEffect(() => {
    fetchTrucks();
    fetchDrivers();
  }, [fetchTrucks, fetchDrivers]);

  const addTruck = useCallback(async (truck) => {
    const response = await api.post("/trucks/", truck);
    setTrucks((prev) => [...prev, response.data]);
    return response.data;
  }, []);

  const updateTruck = useCallback(async (truckId, data) => {
    const response = await api.put(`/trucks/${truckId}/`, data);
    setTrucks((prev) =>
      prev.map((t) => (t.truck_id === truckId ? response.data : t))
    );
    return response.data;
  }, []);

  const deleteTruck = useCallback(
    async (truckId) => {
      const activeJobs = jobs.filter(
        (j) =>
          j.truckId === truckId &&
          (j.status === "pending" || j.status === "in-progress")
      );

      if (activeJobs.length > 0) return false;

      await api.delete(`/trucks/${truckId}/`);
      setTrucks((prev) => prev.filter((t) => t.truck_id !== truckId));
      return true;
    },
    [jobs]
  );

  const addDriver = useCallback(async (driver) => {
    const response = await api.post("/drivers/", driver);
    setDrivers((prev) => [...prev, response.data]);
    return response.data;
  }, []);

  const updateDriver = useCallback(async (driverId, data) => {
    const response = await api.put(`/drivers/${driverId}/`, data);
    setDrivers((prev) =>
      prev.map((d) => (d.driver_id === driverId ? response.data : d))
    );
    return response.data;
  }, []);

  const deleteDriver = useCallback(
    async (driverId) => {
      const activeJobs = jobs.filter(
        (j) =>
          j.driverId === driverId &&
          (j.status === "pending" || j.status === "in-progress")
      );

      if (activeJobs.length > 0) return false;

      await api.delete(`/drivers/${driverId}/`);
      setDrivers((prev) => prev.filter((d) => d.driver_id !== driverId));
      return true;
    },
    [jobs]
  );

  const addJob = useCallback((job) => {
    const id = `JOB-${Date.now()}`;
    setJobs((prev) => [
      ...prev,
      { ...job, id, createdAt: new Date().toISOString(), notes: [] },
    ]);

    if (job.truckId && job.status === "in-progress") {
      setTrucks((prev) =>
        prev.map((t) =>
          t.truck_id === job.truckId ? { ...t, status: "in_transit" } : t
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
            t.truck_id === job.truckId ? { ...t, status: "available" } : t
          )
        );
      }

      if (status === "in-progress" && job.truckId) {
        setTrucks((pt) =>
          pt.map((t) =>
            t.truck_id === job.truckId ? { ...t, status: "in_transit" } : t
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
      (d) => !busyDriverIds.has(d.driver_id)
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
    (id) => trucks.find((t) => t.truck_id === id),
    [trucks]
  );

  const getDriverById = useCallback(
    (id) => drivers.find((d) => d.driver_id === id),
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
        loading,
        fetchTrucks,
        fetchDrivers,
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