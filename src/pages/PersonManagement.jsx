import React, { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { personService } from '../services/api/persons'
import { useNotifications } from '../contexts/NotificationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const PersonManagement = () => {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [showAddModal, setShowAddModal] = useState(false)
  const { success, error } = useNotifications()

  useEffect(() => {
    loadPersons()
  }, [pagination.page])

  const loadPersons = async () => {
    try {
      setLoading(true)
      const response = await personService.getPersons(pagination.page, 20, {
        search: searchTerm
      })
      setPersons(response.data.persons || [])
      setPagination(response.pagination || pagination)
    } catch (err) {
      error('Failed to load persons')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadPersons()
  }

  const handleDeletePerson = async (personId) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return
    
    try {
      await personService.deletePerson(personId)
      success('Person deleted successfully')
      loadPersons()
    } catch (err) {
      error('Failed to delete person')
    }
  }

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Person Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage registered persons in your system
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search persons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {pagination.total} total persons
        </div>
      </div>

      {/* Persons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPersons.map((person) => (
          <PersonCard 
            key={person.id} 
            person={person} 
            onDelete={handleDeletePerson}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={!pagination.has_prev}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={!pagination.has_next}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {filteredPersons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            No persons found. Click "Add Person" to get started.
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <AddPersonModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadPersons()
            success('Person added successfully')
          }}
        />
      )}
    </div>
  )
}

const PersonCard = ({ person, onDelete }) => {
  const primaryImage = person.images?.[0]
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-4xl">
            👤
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {person.name}
          </h3>
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(person.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>Images: {person.images?.length || 0}</div>
          {person.lastSeen && (
            <div>Last seen: {new Date(person.lastSeen).toLocaleDateString()}</div>
          )}
          <div>Added: {new Date(person.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  )
}

const AddPersonModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const { error } = useNotifications()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      error('Person name is required')
      return
    }
    if (images.length === 0) {
      error('At least one image is required')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', name.trim())
      images.forEach((image, index) => {
        formData.append('images', image)
      })

      await personService.createPerson(formData)
      onSuccess()
    } catch (err) {
      error('Failed to add person')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Add New Person
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter person name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select multiple images for better recognition accuracy
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? <LoadingSpinner size="small" /> : null}
              <span>Add Person</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonManagement