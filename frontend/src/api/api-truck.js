import api from "@/api/axios";

export const getTrucks = async () => {
  const response = await api.get("/trucks/");
  return response.data;
};

export const createTruck = async (data) => {
  const response = await api.post("/trucks/", data);
  return response.data;
};

export const updateTruck = async (id, data) => {
  const response = await api.patch(`/trucks/${id}/`, data);
  return response.data;
};

export const deleteTruck = async (id) => {
  await api.delete(`/trucks/${id}/`);
};