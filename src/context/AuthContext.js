'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/lib/database'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        try {
          const userProfile = await getUserProfile(user.id)
          setProfile(userProfile)
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError)
          // Create profile if it doesn't exist
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                username: user.email.split('@')[0],
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
              })
              .select()
              .single()
            
            if (createError) throw createError
            setProfile(newProfile)
          } catch (createProfileError) {
            console.error('Error creating user profile:', createProfileError)
          }
        }
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUser])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
    return data
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    refetchProfile: fetchUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

