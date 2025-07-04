'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Target, Users, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getUserCommunities, createChallenge } from '@/lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Loading from '@/components/Loading'
import ProtectedRoute from '@/components/ProtectedRoute'

function CreateChallengeContent() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [userCommunities, setUserCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    community_id: '',
    start_date: '',
    end_date: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      loadUserCommunities()
    }
  }, [user])

  const loadUserCommunities = async () => {
    try {
      setLoading(true)
      const communities = await getUserCommunities(user.id)
      
      // Filter communities where user is a leader
      const leaderCommunities = communities.filter(community => 
        community.leader_id === user.id
      )
      
      setUserCommunities(leaderCommunities)
      
      // Auto-select if only one community
      if (leaderCommunities.length === 1) {
        setFormData(prev => ({
          ...prev,
          community_id: leaderCommunities[0].id
        }))
      }
    } catch (error) {
      console.error('Error loading communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    if (!formData.community_id) {
      newErrors.community_id = 'Please select a community'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      const now = new Date()

      if (startDate < now) {
        newErrors.start_date = 'Start date cannot be in the past'
      }

      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date'
      }

      const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24)
      if (diffDays < 1) {
        newErrors.end_date = 'Challenge must run for at least 1 day'
      }
      if (diffDays > 30) {
        newErrors.end_date = 'Challenge cannot run for more than 30 days'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    
    try {
      const challengeData = {
        ...formData,
        created_by: user.id,
        status: 'active',
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      }

      const newChallenge = await createChallenge(challengeData)
      
      // Redirect to the new challenge
      router.push(`/challenges/${newChallenge.id}`)
    } catch (error) {
      console.error('Error creating challenge:', error)
      setErrors({ submit: 'Failed to create challenge. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (userCommunities.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Communities to Manage
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be a community leader to create challenges. 
            Join communities or create your own to get started.
          </p>
          <Button onClick={() => router.push('/communities')}>
            Browse Communities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Challenge</h1>
        <p className="text-gray-600">
          Create an engaging challenge for your community members to participate in.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Challenge Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community <span className="text-red-500">*</span>
              </label>
              <select
                name="community_id"
                value={formData.community_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="">Select a community</option>
                {userCommunities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
              {errors.community_id && (
                <p className="text-sm text-red-600 mt-1">{errors.community_id}</p>
              )}
            </div>

            {/* Title */}
            <Input
              label="Challenge Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a compelling challenge title"
              required
              disabled={submitting}
              error={errors.title}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the challenge, requirements, and what participants should create..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Start Date"
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                disabled={submitting}
                error={errors.start_date}
              />

              <Input
                label="End Date"
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                disabled={submitting}
                error={errors.end_date}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <Target size={16} />
                Create Challenge
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreateChallengePage() {
  return (
    <ProtectedRoute>
      <CreateChallengeContent />
    </ProtectedRoute>
  )
}

