import axiosInstance from "./axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

// Backend TransformInterceptor wraps all responses in { data: ... }
export interface BackendResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  error: string;
}

class ApiClient {
  private unwrapResponse<T>(response: AxiosResponse<T>): T {
    // response.data is already unwrapped by axios interceptor
    return response.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(url, config);
    return this.unwrapResponse(response);
  }

  async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedResponse<T>> {
    const params = { ...config?.params };
    
    // Map page/limit to skip/take for backend
    if (params.page !== undefined && params.limit !== undefined && params.skip === undefined) {
      params.take = params.limit;
      params.skip = (params.page - 1) * params.limit;
      delete params.page;
      delete params.limit;
    }

    const response = await axiosInstance.get<T[]>(url, {
      ...config,
      params,
    });
    
    return {
      data: response.data,
      meta: (response as any).meta ?? {
        page: params.page || 1,
        limit: params.limit || response.data.length,
        total: response.data.length,
        totalPages: 1,
      },
    };
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await axiosInstance.post<T>(url, data, config);
    return this.unwrapResponse(response);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await axiosInstance.patch<T>(url, data, config);
    return this.unwrapResponse(response);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await axiosInstance.put<T>(url, data, config);
    return this.unwrapResponse(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<T>(url, config);
    return this.unwrapResponse(response);
  }

  async getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const response = await axiosInstance.get(url, { ...config, responseType: 'blob' });
    return response.data;
  }
}

export const apiClient = new ApiClient();
