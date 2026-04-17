import { useState, useMemo } from "react";
import { useFleet } from "@/context/FleetContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DriverFormDialog } from "@/components/DriverFormDialog";
import { Plus, Search, Eye, Pencil, Trash2, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function DriverListPage() {
  const { drivers, deleteDriver, getActiveJobsForDriver } = useFleet();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, search, statusFilter]);

  const handleDelete = (id: string) => {
    const activeJobs = getActiveJobsForDriver(id);
    if (activeJobs.length > 0) {
      toast({ title: "Cannot delete", description: `Driver has ${activeJobs.length} active job(s).`, variant: "destructive" });
      return;
    }
    if (confirm("Are you sure you want to delete this driver?")) {
      deleteDriver(id);
      toast({ title: "Driver deleted" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Drivers</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet drivers</p>
        </div>
        <Button onClick={() => { setEditId(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Driver
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or license..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Active Jobs</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((driver) => {
                const activeCount = getActiveJobsForDriver(driver.id).length;
                return (
                  <tr key={driver.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{driver.id}</td>
                    <td className="px-5 py-3">{driver.name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{driver.licenseNumber}</td>
                    <td className="px-5 py-3 text-muted-foreground">{driver.phone}</td>
                    <td className="px-5 py-3">
                      <Badge className={driver.status === "active" ? "bg-status-available-bg text-status-available border-0" : "bg-secondary text-status-inactive border-0"}>
                        {driver.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {activeCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-status-transit"><Briefcase className="h-3.5 w-3.5" /> {activeCount}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/drivers/${driver.id}`)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditId(driver.id); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(driver.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">No drivers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <DriverFormDialog open={formOpen} onOpenChange={setFormOpen} editDriverId={editId} />
    </div>
  );
}
