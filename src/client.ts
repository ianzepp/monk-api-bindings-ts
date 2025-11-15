import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse, MonkClientConfig } from './types/index.js';

export class MonkClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tenants: Map<string, string> = new Map();
  private currentTenant: string | null = null;

  constructor(config: MonkClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }

  setTenant(name: string, token: string): void {
    this.tenants.set(name, token);
  }

  useTenant(name: string): void {
    const token = this.tenants.get(name);
    if (!token) {
      throw new Error(`Tenant '${name}' not found. Use setTenant() first.`);
    }
    this.currentTenant = name;
    this.token = token;
  }

  getTenant(name: string): string | undefined {
    return this.tenants.get(name);
  }

  getCurrentTenant(): string | null {
    return this.currentTenant;
  }

  listTenants(): string[] {
    return Array.from(this.tenants.keys());
  }

  clearTenant(name: string): void {
    this.tenants.delete(name);
    if (this.currentTenant === name) {
      this.currentTenant = null;
      this.token = null;
    }
  }

  clearAllTenants(): void {
    this.tenants.clear();
    this.currentTenant = null;
    this.token = null;
  }

  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.request<ApiResponse<T>>(config);
    return response.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}
