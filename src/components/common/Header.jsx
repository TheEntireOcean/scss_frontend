import React, { useState } from 'react'
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import clsx from 'clsx'

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setProfileMenuOpen(false)
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-800">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-300"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-gray-900/10 lg:hidden dark:bg-white/10" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Face Recognition System
          </h1>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Connection Status */}
          <div className="flex items-center gap-x-2">
            <div className={clsx(
              'h-2 w-2 rounded-full',
              connected ? 'bg-green-400' : 'bg-red-400'
            )} />
            <span className="text-sm text