import { apiClient } from '@/lib/api/axios';
import { ApiResponse } from '@/types';

export interface UploadedFileResponse {
  fileId: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export const uploadService = {
  /**
   * Tải lên 1 file ảnh từ máy tính
   */
  async uploadSingle(file: File): Promise<ApiResponse<UploadedFileResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<UploadedFileResponse>>('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Tải lên nhiều file ảnh cùng lúc từ máy tính
   */
  async uploadMultiple(files: File[]): Promise<ApiResponse<UploadedFileResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<ApiResponse<UploadedFileResponse[]>>('/upload/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
