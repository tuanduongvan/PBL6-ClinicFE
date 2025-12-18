import apiClient from "./axios-config";
import { Schedule, CreateSchedulePayload } from "@/types/schudele";

export const scheduleApi = {
  getMySchedules: async (): Promise<Schedule[]> => {
    const response = await apiClient.get("/schedules/"); 
    return response.data;
  },

  createSchedule: async (data: CreateSchedulePayload): Promise<Schedule> => {
    const response = await apiClient.post("/schedules/", data);
    return response.data;
  },

  updateSchedule: async (id: number, data: CreateSchedulePayload): Promise<Schedule> => {
    const response = await apiClient.patch(`/schedules/${id}/`, data);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/schedules/${id}/`);
  },
};