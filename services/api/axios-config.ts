import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://italiano-sticks-designing-intend.trycloudflare.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Ignore aborted and network errors - let them be handled by individual API calls
    if (
      error.code === 'ERR_CANCELED' || 
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Request aborted' || 
      error.message === 'Network Error' ||
      error.name === 'AbortError' ||
      error.name === 'NetworkError' ||
      !error.response // Network errors typically don't have a response
    ) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('refreshToken')
          : null;

      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            'https://italiano-sticks-designing-intend.trycloudflare.com/api'
          }/accounts/refresh/`,
          { refresh: refreshToken }
        );

        // Backend returns: { message, tokens: { access, refresh } }
        const tokens = response.data.tokens || response.data;
        const { access, refresh: newRefreshToken } = tokens;

        if (!access) {
          throw new Error('No access token in refresh response');
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', access);
          // Save new refresh token if provided (backend returns new refresh token)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
        }

        apiClient.defaults.headers.common['Authorization'] =
          'Bearer ' + access;

        processQueue(null, access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = 'Bearer ' + access;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
  }
}

export default apiClient;
