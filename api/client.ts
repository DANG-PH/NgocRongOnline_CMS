import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const api = {
  get: async <T = any>(
    url: string, 
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    return await axios.get<T>(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    });
  },

 
  post: async <T = any>(
    url: string, 
    data: any = {}, 
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    return await axios.post<T>(`${API_BASE_URL}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    });
  },


  put: async <T = any>(
    url: string, 
    data: any = {}, 
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    return await axios.put<T>(`${API_BASE_URL}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    });
  },


  delete: async <T = any>(
    url: string, 
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    return await axios.delete<T>(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    });
  },

 
  patch: async <T = any>(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    
    return await axios.patch<T>(`${API_BASE_URL}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers,
      },
      ...config,
    });
  },
};

export { API_BASE_URL };