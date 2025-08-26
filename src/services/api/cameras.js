import apiClient from './client'

export const cameraService = {
  async getCameras(page = 1, perPage = 20, filters = {}) {
    return apiClient.get('/cameras', { page, per_page: perPage, ...filters })
  },
  
  async getCamera(id) {
    return apiClient.get(`/cameras/${id}`)
  },
  
  async createCamera(data) {
    return apiClient.post('/cameras', data)
  },
  
  async updateCamera(id, data) {
    return apiClient.put(`/cameras/${id}`, data)
  },
  
  async deleteCamera(id) {
    return apiClient.delete(`/cameras/${id}`)
  },
  
  async startCamera(id) {
    return apiClient.post(`/cameras/${id}/start`)
  },
  
  async stopCamera(id) {
    return apiClient.post(`/cameras/${id}/stop`)
  },
  
  async updateCameraSettings(id, settings) {
    return apiClient.put(`/cameras/${id}/settings`, settings)
  },
  
  async discoverCameras() {
    return apiClient.get('/cameras/discover')
  },

  async getCameraStream(id) {
    return apiClient.get(`/cameras/${id}/stream`)
  }
}