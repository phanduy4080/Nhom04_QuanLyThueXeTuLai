import { apiClient } from '@/lib/api/axios';

export const rentalService = {
  getHandovers: async () => {
    const res = await apiClient.get('/rental/handovers');
    return res.data;
  },

  createHandover: async (data: any) => {
    const res = await apiClient.post('/rental/handovers', data);
    return res.data;
  },
};
