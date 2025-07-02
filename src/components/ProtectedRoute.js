'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Loading from '@/components/Loading'
import AuthModal from '@/features/auth/AuthModal'

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true)
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in to access this page.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return children
}

export default ProtectedRoute

