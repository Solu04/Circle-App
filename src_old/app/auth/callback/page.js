'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Loading from '@/components/Loading'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          // Successful authentication, redirect to home or intended page
          const redirectTo = sessionStorage.getItem('redirectAfterAuth') || '/'
          sessionStorage.removeItem('redirectAfterAuth')
          router.push(redirectTo)
        } else {
          // No session, redirect to home
          router.push('/')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

