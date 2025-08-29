// src/services/api/client.js - Updated for backend integration
import axios from 'axios'

class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000, // Increased timeout for file uploads
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
        }
        
        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
        }
        
        // Handle different response structures
        return response.data
      },
      (error) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)
        }
        
        // Handle different error scenarios
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        } else if (error.response?.status === 403) {
          // Forbidden - insufficient permissions
          console.warn('Access forbidden:', error.response.data)
        } else if (error.response?.status >= 500) {
          // Server errors
          console.error('Server error:', error.response.data)
        } else if (error.code === 'ECONNABORTED') {
          // Timeout
          console.error('Request timeout')
        } else if (!error.response) {
          // Network error
          console.error('Network error - backend may be down')
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  async get(url, params = {}) {
    return this.client.get(url, { params })
  }
  
  async post(url, data = {}) {
    return this.client.post(url, data)
  }
  
  async put(url, data = {}) {
    return this.client.put(url, data)
  }
  
  async patch(url, data = {}) {
    return this.client.patch(url, data)
  }
  
  async delete(url) {
    return this.client.delete(url)
  }

  async upload(url, formData, onUploadProgress = null) {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onUploadProgress(percentCompleted)
      } : undefined,
    })
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.client.get('/health')
      return { healthy: true, data: response }
    } catch (error) {
      return { healthy: false, error: error.message }
    }
  }
}

export default new APIClient()