import { apiRequest } from '@/lib/api';

export interface CheckInData {
  mood: string;
  moodCauses: string[];
  moodIntensity: number;
  notes?: string;
  companions: string[];
  location?: string;
  customLocationDetails?: string;
}

export interface CheckInResponse {
  id: number;
  userId: string;
  mood: string;
  moodCauses: string[];
  moodIntensity: number;
  notes: string | null;
  companions: string[];
  location: string | null;
  customLocationDetails: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createCheckIn(checkInData: CheckInData): Promise<CheckInResponse> {
  return apiRequest<CheckInResponse>('/api/check-ins', {
    method: 'POST',
    body: JSON.stringify(checkInData),
  });
}

export async function getCheckIns(limit = 10, offset = 0): Promise<CheckInResponse[]> {
  return apiRequest<CheckInResponse[]>(`/api/check-ins?limit=${limit}&offset=${offset}`);
}