'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { useAuth } from '@/context/AuthContext'

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode) // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    confirmPassword: ''
  })

  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return false
    }

    if (mode === 'signup') {
      if (!formData.username || !formData.fullName) {
        setError('Username and full name are required')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.username, formData.fullName)
      }
      
      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        username: '',
        fullName: '',
        confirmPassword: ''
      })
      onClose()
    } catch (error) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setFormData({
      email: '',
      password: '',
      username: '',
      fullName: '',
      confirmPassword: ''
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back' : 'Join Circle'}
      size="md"
    >
      <div className="space-y-6">
        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          <Chrome size={20} />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
              
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                required
                disabled={loading}
              />
            </>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
            disabled={loading}
          />

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AuthModal

