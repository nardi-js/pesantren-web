import axios, { AxiosResponse, AxiosError } from "axios";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}

// Helper function to get base URL for API calls
function getBaseURL() {
  // In browser
  if (typeof window !== "undefined") {
    return "/api";
  }
  // In server-side rendering - use absolute URL
  const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || "3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.VERCEL_URL || `localhost:${port}`;

  return process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api`
    : `${protocol}://${host}/api`;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only try to get token in browser environment
    let token: string | null = null;

    if (typeof window !== "undefined") {
      // Get token from localStorage or cookies
      token =
        localStorage.getItem("admin-token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("admin-token="))
          ?.split("=")[1] ||
        null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Unauthorized - redirect to login (only in browser)
      localStorage.removeItem("admin-token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export class PublicApiClient {
  /**
   * GET request for public endpoints (no auth)
   */
  static async get<T>(
    url: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    try {
      // Use fetch for server-side, axios for client-side
      if (typeof window === "undefined") {
        // Server-side: use fetch with absolute URL
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const queryString = params
          ? "?" +
            new URLSearchParams(params as Record<string, string>).toString()
          : "";
        const fullUrl = `${baseUrl}/api${url}${queryString}`;

        const response = await fetch(fullUrl);
        const data = await response.json();
        return data;
      } else {
        // Client-side: use axios with relative URL
        const response = await axios.get(`/api${url}`, { params });
        return response.data;
      }
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError<T>(error: unknown): ApiResponse<T> {
    console.error("API Error:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      // Server responded with error status
      return {
        success: false,
        error:
          ((axiosError.response?.data as Record<string, unknown>)
            ?.error as string) ||
          axiosError.response?.statusText ||
          "Server error",
        details: (axiosError.response?.data as Record<string, unknown>)
          ?.details as Record<string, unknown>,
      };
    } else if (error && typeof error === "object" && "request" in error) {
      // Request was made but no response received
      return {
        success: false,
        error: "Network error - please check your connection",
      };
    } else {
      // Something else happened
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export class ApiClient {
  /**
   * GET request
   */
  static async get<T>(
    url: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * POST request
   */
  static async post<T>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * PUT request
   */
  static async put<T>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * DELETE request
   */
  static async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Upload file with progress
   */
  static async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Add additional data if provided
      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          const value = additionalData[key];
          formData.append(key, String(value));
        });
      }

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles<T>(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      // Add additional data if provided
      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          const value = additionalData[key];
          formData.append(key, String(value));
        });
      }

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Submit form with file upload
   */
  static async submitFormWithFiles<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError<T>(error: unknown): ApiResponse<T> {
    console.error("API Error:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      // Server responded with error status
      return {
        success: false,
        error:
          ((axiosError.response?.data as Record<string, unknown>)
            ?.error as string) ||
          axiosError.response?.statusText ||
          "Server error",
        details: (axiosError.response?.data as Record<string, unknown>)
          ?.details as Record<string, unknown>,
      };
    } else if (error && typeof error === "object" && "request" in error) {
      // Request was made but no response received
      return {
        success: false,
        error: "Network error - please check your connection",
      };
    } else {
      // Something else happened
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Convenience methods for admin API endpoints
export class AdminApi {
  // Blog API methods
  static async getBlogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/blog", params);
  }

  static async getBlog(id: string) {
    return ApiClient.get(`/admin/blog/${id}`);
  }

  static async createBlog(data: Record<string, unknown>) {
    return ApiClient.post("/admin/blog", data);
  }

  static async updateBlog(id: string, data: Record<string, unknown>) {
    return ApiClient.put(`/admin/blog/${id}`, data);
  }

  static async deleteBlog(id: string) {
    return ApiClient.delete(`/admin/blog/${id}`);
  }

  // News API methods
  static async getNews(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/news", params);
  }

  static async createNews(data: Record<string, unknown> | FormData) {
    // If it's FormData, let browser set the Content-Type header automatically
    const config = data instanceof FormData ? {} : undefined;
    return ApiClient.post("/admin/news", data, config);
  }

  static async getNewsById(id: string) {
    return ApiClient.get(`/admin/news/${id}`);
  }

  static async updateNews(
    id: string,
    data: Record<string, unknown> | FormData
  ) {
    return ApiClient.put(`/admin/news/${id}`, data);
  }

  static async deleteNews(id: string) {
    return ApiClient.delete(`/admin/news/${id}`);
  }

  // Events API methods
  static async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/events", params);
  }

  static async createEvent(data: Record<string, unknown>) {
    return ApiClient.post("/admin/events", data);
  }

  static async getEventById(id: string) {
    return ApiClient.get(`/admin/events/${id}`);
  }

  static async updateEvent(id: string, data: Record<string, unknown>) {
    return ApiClient.put(`/admin/events/${id}`, data);
  }

  static async deleteEvent(id: string) {
    return ApiClient.delete(`/admin/events/${id}`);
  }

  // Gallery API methods
  static async getGallery(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    tag?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/gallery", params);
  }

  static async createGalleryItem(data: FormData | Record<string, unknown>) {
    return ApiClient.post("/admin/gallery", data);
  }

  static async getGalleryItemById(id: string) {
    return ApiClient.get(`/admin/gallery/${id}`);
  }

  static async updateGalleryItem(
    id: string,
    data: FormData | Record<string, unknown>
  ) {
    return ApiClient.put(`/admin/gallery/${id}`, data);
  }

  static async deleteGalleryItem(id: string) {
    return ApiClient.delete(`/admin/gallery/${id}`);
  }

  // Testimonials API methods
  static async getTestimonials(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    rating?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/testimonials", params);
  }

  static async createTestimonial(data: Record<string, unknown>) {
    return ApiClient.post("/admin/testimonials", data);
  }

  static async getTestimonialById(id: string) {
    return ApiClient.get(`/admin/testimonials/${id}`);
  }

  static async updateTestimonial(id: string, data: Record<string, unknown>) {
    return ApiClient.put(`/admin/testimonials/${id}`, data);
  }

  static async deleteTestimonial(id: string) {
    return ApiClient.delete(`/admin/testimonials/${id}`);
  }

  // Donations API methods
  static async getDonations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    campaign?: string;
    method?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/donations", params);
  }

  static async createDonation(data: Record<string, unknown>) {
    return ApiClient.post("/admin/donations", data);
  }

  // static async createDonationMock(data: Record<string, unknown>) {
  //   return ApiClient.post("/admin/donations-mock", data);
  // }

  static async getDonationById(id: string) {
    return ApiClient.get(`/admin/donations/${id}`);
  }

  static async updateDonation(id: string, data: Record<string, unknown>) {
    return ApiClient.put(`/admin/donations/${id}`, data);
  }

  static async deleteDonation(id: string) {
    return ApiClient.delete(`/admin/donations/${id}`);
  }

  // Campaigns API methods
  static async getCampaigns(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return ApiClient.get("/admin/campaigns", params);
  }

  static async createCampaign(data: Record<string, unknown>) {
    return ApiClient.post("/admin/campaigns", data);
  }

  static async getCampaignById(id: string) {
    return ApiClient.get(`/admin/campaigns/${id}`);
  }

  static async updateCampaign(id: string, data: Record<string, unknown>) {
    return ApiClient.put(`/admin/campaigns/${id}`, data);
  }

  static async deleteCampaign(id: string) {
    return ApiClient.delete(`/admin/campaigns/${id}`);
  }

  // Upload API methods
  static async uploadSingleFile(
    file: File,
    type: string = "general",
    onProgress?: (progress: number) => void
  ) {
    return ApiClient.uploadFile(`/admin/upload?type=${type}`, file, onProgress);
  }

  static async uploadMultipleFiles(
    files: File[],
    type: string = "general",
    onProgress?: (progress: number) => void
  ) {
    return ApiClient.uploadMultipleFiles(
      `/admin/upload?type=${type}&multiple=true`,
      files,
      onProgress
    );
  }

  // Form submission with files
  static async submitBlogForm(
    formData: FormData,
    onProgress?: (progress: number) => void
  ) {
    return ApiClient.submitFormWithFiles("/admin/blog", formData, onProgress);
  }

  static async updateBlogForm(
    id: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ) {
    return ApiClient.submitFormWithFiles(
      `/admin/blog/${id}`,
      formData,
      onProgress
    );
  }

  static async submitNewsForm(
    formData: FormData,
    onProgress?: (progress: number) => void
  ) {
    return ApiClient.submitFormWithFiles("/admin/news", formData, onProgress);
  }
}

// Frontend API methods (public endpoints)
export class FrontendApi {
  // News API methods for frontend
  static async getNews(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return PublicApiClient.get("/news", params);
  }

  static async getNewsBySlug(slug: string) {
    return PublicApiClient.get(`/news/${slug}`);
  }

  static async getFeaturedNews(limit = 3) {
    return PublicApiClient.get("/news", { featured: true, limit });
  }

  static async getLatestNews(limit = 5) {
    return PublicApiClient.get("/news", {
      limit,
      sortBy: "publishedAt",
      sortOrder: "desc",
    });
  }

  static async getNewsByCategory(category: string, limit = 10) {
    return PublicApiClient.get("/news", { category, limit });
  }
}

export default ApiClient;
