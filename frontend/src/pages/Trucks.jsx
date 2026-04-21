import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TruckFormDialog } from "@/components/TruckFormDialog";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axios";

const statusStyles = {
  available: "bg-status-available-bg text-status-available border-0",
  in_transit: "bg-status-transit-bg text-status-transit border-0",
  maintenance: "bg-status-maintenance-bg text-status-maintenance border-0",
};

const statusLabels = {
  available: "Available",
  in_transit: "In Transit",
  maintenance: "Maintenance",
};

const PAGE_SIZE = 10;

export default function TruckListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/trucks/");
      setTrucks(response.data);
    } catch (error) {
      console.error("Failed to fetch trucks:", error);
      toast({
        title: "Error",
        description: "Failed to load trucks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return trucks.filter((truck) => {
      const matchSearch =
        !search ||
        truck.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
        truck.truck_id?.toString().includes(search.toLowerCase()) ||
        truck.capacity?.toString().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || truck.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [trucks, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (truckId) => {
    if (!window.confirm("Are you sure you want to delete this truck?")) return;

    try {
      await api.delete(`/trucks/${truckId}/`);
      setTrucks((prev) => prev.filter((truck) => truck.truck_id !== truckId));
      toast({ title: "Truck deleted" });
    } catch (error) {
      console.error("Failed to delete truck:", error);
      toast({
        title: "Cannot delete",
        description:
          error?.response?.data?.detail ||
          "Failed to delete truck. It may have active jobs or be in use.",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = async () => {
    await fetchTrucks();
    setFormOpen(false);
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Trucks</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet vehicles</p>
        </div>

        <Button
          onClick={() => {
            setEditId(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Truck
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by registration, ID, or capacity..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Truck ID</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Registration</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Capacity</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    Loading trucks...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((truck) => (
                  <tr key={truck.truck_id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-3 font-medium">{truck.truck_id}</td>
                    <td className="px-5 py-3 font-mono text-xs">{truck.registration_number}</td>
                    <td className="px-5 py-3">{truck.capacity}</td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          statusStyles[truck.status] ||
                          "border-0 bg-secondary text-muted-foreground"
                        }
                      >
                        {statusLabels[truck.status] || truck.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/trucks/${truck.truck_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditId(truck.truck_id);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(truck.truck_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No trucks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </p>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <TruckFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditId(null);
        }}
        editTruckId={editId}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}