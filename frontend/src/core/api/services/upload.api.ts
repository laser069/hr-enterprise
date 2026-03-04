import { apiClient } from '../api-client';

export interface UploadResponse {
    message: string;
    data: {
        id: string;
        url: string;
        originalName: string;
        size: number;
        category: string;
    };
}

export const uploadApi = {
    upload: (file: File, category: string, employeeId?: string, description?: string): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        if (employeeId) formData.append('employeeId', employeeId);
        if (description) formData.append('description', description);

        return apiClient.post<UploadResponse>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    delete: (id: string): Promise<void> => {
        return apiClient.delete(`/upload/${id}`);
    },
};
