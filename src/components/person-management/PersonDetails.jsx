// src/components/person-management/PersonDetails.jsx
import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon, CameraIcon } from '@heroicons/react/24/outline'
import { personService } from '../../services/api/persons'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingSpinner from '../common/LoadingSpinner'

const PersonDetails = ({ personId, onClose, onUpdate }) => {
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const { success, error } = useNotifications()

  useEffect(() => {
    if (personId) {
      loadPerson()
    }
  }, [personId])

  const loadPerson = async () => {
    try {
      setLoading(true)
      const response = await personService.getPerson(personId)
      setPerson(response.data.person)
      setEditName(response.data.person.name)
    } catch (err) {
      error('Failed to load person details')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    try {
      const response = await personService.updatePerson(personId, { 
        name: editName.trim() 
      })
      setPerson(response.data.person)
      setEditMode(false)
      success('Name updated successfully')
      onUpdate?.()
    } catch (err) {
      error('Failed to update name')
    }
  }

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setUploading(true)
      const formData = new FormData()
      files.forEach(file => formData.append('images', file))

      const response = await personService.addPersonImages(personId, formData)
      setPerson(response.data.person)
      success(`Added ${files.length} image(s)`)
      onUpdate?.()
    } catch (err) {
      error('Failed to add images')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imagePath) => {
    if (!confirm('Delete this image?')) return

    try {
      await personService.deletePersonImage(personId, imagePath)
      setPerson(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imagePath)
      }))
      success('Image deleted')
      onUpdate?.()
    } catch (err) {
      error('Failed to delete image')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    )
  }

  if (!person) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {editMode ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 text-gray-900 dark:text-white focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateName()}
                />
                <button
                  onClick={handleUpdateName}
                  className="text-green-600 hover:text-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setEditName(person.name)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {person.name}
                </h1>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Person Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Images
              </h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {person.images?.length || 0}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Last Seen
              </h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {person.lastSeen 
                  ? new Date(person.lastSeen).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created
              </h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {new Date(person.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Add Images */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Images ({person.images?.length || 0})
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  className="hidden"
                  id="add-images"
                />
                <label
                  htmlFor="add-images"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
                >
                  {uploading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                  <span>Add Images</span>
                </label>
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {person.images?.map((imagePath, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imagePath}
                    alt={`${person.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeleteImage(imagePath)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Empty State */}
              {(!person.images || person.images.length === 0) && (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>No images uploaded</p>
                  <p className="text-sm">Add images for better recognition</p>
                </div>
              )}
            </div>
          </div>

          {/* Recognition History */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Recognitions
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Recognition history coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonDetails