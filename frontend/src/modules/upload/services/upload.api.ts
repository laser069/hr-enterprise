import { apiClient } from '../../../core/api/api-client';

export const uploadApi = {
  uploadFile: async (file: File, path: string = 'uploads'): Promise<{ url: string; key: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteFile: async (key: string): Promise<void> => {
    return apiClient.delete(`/upload/${key}`);
  },
};
