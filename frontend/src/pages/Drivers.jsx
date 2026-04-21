import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DriverFormDialog } from "@/components/DriverFormDialog";
import { Plus, Search, Eye, Pencil, Trash2, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

export default function DriverListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [drivers, setDrivers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [driversRes, jobsRes] = await Promise.all([
        api.get("/drivers/"),
        api.get("/jobs/"),
      ]);

      setDrivers(driversRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error("Failed to load drivers data:", error);
      toast({
        title: "Error",
        description: "Failed to load drivers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveJobsForDriver = (driverId) => {
    return jobs.filter(
      (job) =>
        job.assigned_driver === driverId &&
        job.status !== "completed" &&
        job.status !== "cancelled"
    );
  };

  const filtered = useMemo(() => {
    return drivers.filter((driver) => {
      return (
        !search ||
        driver.name?.toLowerCase().includes(search.toLowerCase()) ||
        driver.license_number?.toLowerCase().includes(search.toLowerCase()) ||
        driver.phone_number?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [drivers, search]);

  const handleDelete = async (driverId) => {
    const activeJobs = getActiveJobsForDriver(driverId);

    if (activeJobs.length > 0) {
      toast({
        title: "Cannot delete",
        description: `Driver has ${activeJobs.length} active job(s).`,
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this driver?")) return;

    try {
      await api.delete(`/drivers/${driverId}`);
      setDrivers((prev) =>
        prev.filter((driver) => driver.driver_id !== driverId)
      );
      toast({ title: "Driver deleted" });
    } catch (error) {
      console.error("Failed to delete driver:", error);
      toast({
        title: "Error",
        description: "Failed to delete driver.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Drivers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your fleet drivers
          </p>
        </div>

        <Button
          onClick={() => {
            setEditId(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Driver
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, license, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Driver ID</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">License</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Active Jobs</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    Loading drivers...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((driver) => {
                  const activeCount = getActiveJobsForDriver(driver.driver_id).length;

                  return (
                    <tr
                      key={driver.driver_id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium">{driver.driver_id}</td>
                      <td className="px-5 py-3">{driver.name}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {driver.license_number}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {driver.phone_number}
                      </td>

                      <td className="px-5 py-3">
                        {activeCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-status-transit">
                            <Briefcase className="h-3.5 w-3.5" /> {activeCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/drivers/${driver.driver_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditId(driver.driver_id);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(driver.driver_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DriverFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditId(null);
        }}
        editDriverId={editId}
      />
    </div>
  );
}