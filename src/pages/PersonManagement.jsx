// src/pages/PersonManagement.jsx
import React, { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { personService } from '../services/api/persons'
import { useNotifications } from '../contexts/NotificationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const PersonManagement = () => {
  const [persons, setPersons] = useState([