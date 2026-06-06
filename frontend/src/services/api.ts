import api from '../config/api';
import { ReportInput, Report, Hotspot, HotspotInsight, Stats } from '../types';

export const submitReport = async (data: ReportInput): Promise<Report> => {
  const response = await api.post<Report>('/api/report', data);
  return response.data;
};

export const getHotspots = async (): Promise<Hotspot[]> => {
  const response = await api.get<Hotspot[]>('/api/hotspots');
  return response.data;
};

export const getHotspotInsight = async (hotspotId: string): Promise<HotspotInsight> => {
  const response = await api.get<HotspotInsight>(`/api/hotspots/${hotspotId}/insight`);
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/api/stats');
  return response.data;
};
