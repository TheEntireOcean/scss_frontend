import axios from 'axios'

class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 10000,
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
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
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

  async upload(url, formData) {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}

export default new APIClient()