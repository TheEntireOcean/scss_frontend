import apiClient from './client'

export const personService = {
  async getPersons(page = 1, perPage = 20, filters = {}) {
    return apiClient.get('/persons', { page, per_page: perPage, ...filters })
  },
  
  async getPerson(id) {
    return apiClient.get(`/persons/${id}`)
  },
  
  async createPerson(formData) {
    return apiClient.upload('/persons', formData)
  },
  
  async updatePerson(id, data) {
    return apiClient.put(`/persons/${id}`, data)
  },
  
  async deletePerson(id) {
    return apiClient.delete(`/persons/${id}`)
  },
  
  async addPersonImages(id, formData) {
    return apiClient.upload(`/persons/${id}/images`, formData)
  },
  
  async deletePersonImage(personId, imagePath) {
    return apiClient.delete(`/persons/${personId}/images`, { image_path: imagePath })
  },
  
  async searchPersons(query, page = 1) {
    return apiClient.get('/persons/search', { q: query, page })
  }
}