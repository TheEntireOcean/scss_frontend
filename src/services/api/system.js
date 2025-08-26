import apiClient from './client'

export const systemService = {
  async getSystemStatus() {
    return apiClient.get('/system/status')
  },
  
  async getSystemConfig() {
    return apiClient.get('/system/config')
  },
  
  async updateSystemConfig(config) {
    return apiClient.put('/system/config', config)
  },
  
  async getPerformanceMetrics() {
    return apiClient.get('/system/metrics')
  },
  
  async restartService(serviceName) {
    return apiClient.post(`/system/services/${serviceName}/restart`)
  },
  
  async resetDatabase() {
    return apiClient.post('/system/database/reset')
  },
  
  async getSystemLogs(level = 'info', limit = 100) {
    return apiClient.get('/system/logs', { level, limit })
  },
  
  async exportSystemData() {
    return apiClient.get('/system/export')
  },
  
  async importSystemData(formData) {
    return apiClient.upload('/system/import', formData)
  }
}