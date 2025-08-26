import apiClient from './client'

export const authService = {
  async login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },
  
  async logout() {
    return apiClient.post('/auth/logout')
  },
  
  async getProfile() {
    return apiClient.get('/auth/profile')
  },
  
  async updateProfile(data) {
    return apiClient.put('/auth/profile', data)
  },
  
  async changePassword(data) {
    return apiClient.put('/auth/change-password', data)
  }
}