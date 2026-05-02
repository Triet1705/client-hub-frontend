import axios, { type AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  // Let callers set content-type for multipart/form-data
  headers: { "Accept": "application/json" },
  withCredentials: true,
});

// Basic response interceptor to unwrap data
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // preserve stack but rethrow for callers to handle
    return Promise.reject(error);
  }
);

export default apiClient;
