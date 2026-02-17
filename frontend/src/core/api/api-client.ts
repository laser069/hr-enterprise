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
  private unwrapResponse<T>(response: AxiosResponse<BackendResponse<T>>): T {
    // Backend wraps responses in { data: T, meta?: ... }
    // We extract the actual data
    return response.data.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<BackendResponse<T>>(url, config);
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
      // Remove frontend-only params if needed, or keep them for compatibility
    }

    const response = await axiosInstance.get<BackendResponse<T[]>>(url, {
      ...config,
      params,
    });
    
    return {
      data: response.data.data,
      meta: response.data.meta!,
    };
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await axiosInstance.post<BackendResponse<T>>(
      url,
      data,
      config,
    );
    return this.unwrapResponse(response);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await axiosInstance.patch<BackendResponse<T>>(
      url,
      data,
      config,
    );
    return this.unwrapResponse(response);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await axiosInstance.put<BackendResponse<T>>(
      url,
      data,
      config,
    );
    return this.unwrapResponse(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<BackendResponse<T>>(
      url,
      config,
    );
    return this.unwrapResponse(response);
  }
}

export const apiClient = new ApiClient();
