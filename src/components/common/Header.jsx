// src/components/common/Header.jsx
import React, { useState } from 'react'
import { Bars3Icon, BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import clsx from 'clsx'

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationCount] = useState(0) // Will be connected to real notifications later

  const handleLogout = async () => {
    await logout()
    setProfileMenuOpen(false)
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-800">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-300"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-gray-900/10 lg:hidden dark:bg-white/10" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Title */}
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
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <BellIcon className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {user?.username}
              </span>
            </button>

            {profileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setProfileMenuOpen(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header