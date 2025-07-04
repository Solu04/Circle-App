'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Link as LinkIcon, Play, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { 
  getChallengeById, 
  isUserMemberOfCommunity,
  createSubmission,
  getUserSubmissions
} from '@/lib/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Loading from '@/components/Loading'
import ProtectedRoute from '@/components/ProtectedRoute'
import { isValidUrl, isValidYouTubeUrl, isValidTwitchUrl } from '@/lib/utils'

function SubmitChallengeContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionType, setSubmissionType] = useState('video') // 'video' or 'livestream'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_url: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (params.id && user) {
      loadChallengeData()
    }
  }, [params.id, user])

  const loadChallengeData = async () => {
    try {
      setLoading(true)
      
      // Load challenge details
      const challengeData = await getChallengeById(params.id)
      setChallenge(challengeData)
      
      // Check if user is a member of the community
      const membershipStatus = await isUserMemberOfCommunity(user.id, challengeData.community_id)
      setIsMember(!!membershipStatus)
      
      if (!membershipStatus) {
        router.push(`/challenges/${params.id}`)
        return
      }
      
      // Check if user already has a submission for this challenge
      const userSubmissions = await getUserSubmissions(user.id)
      const existingSubmission = userSubmissions.find(sub => sub.challenge_id === params.id)
      setHasExistingSubmission(!!existingSubmission)
      
      if (existingSubmission) {
        // Pre-fill form with existing submission data
        setFormData({
          title: existingSubmission.title,
          description: existingSubmission.description || '',
          content_url: existingSubmission.content_url
        })
        setSubmissionType(existingSubmission.submission_type)
      }
    } catch (error) {
      console.error('Error loading challenge data:', error)
      router.push('/challenges')
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
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.content_url.trim()) {
      newErrors.content_url = 'Content URL is required'
    } else if (!isValidUrl(formData.content_url)) {
      newErrors.content_url = 'Please enter a valid URL'
    } else {
      // Validate specific URL types based on submission type
      if (submissionType === 'video') {
        if (!isValidYouTubeUrl(formData.content_url)) {
          newErrors.content_url = 'Please enter a valid YouTube URL for video submissions'
        }
      } else if (submissionType === 'livestream') {
        if (!isValidYouTubeUrl(formData.content_url) && !isValidTwitchUrl(formData.content_url)) {
          newErrors.content_url = 'Please enter a valid YouTube or Twitch URL for livestream submissions'
        }
      }
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    
    try {
      const submissionData = {
        challenge_id: params.id,
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        submission_type: submissionType,
        content_url: formData.content_url.trim()
      }

      await createSubmission(submissionData)
      
      // Redirect to challenge page
      router.push(`/challenges/${params.id}`)
    } catch (error) {
      console.error('Error creating submission:', error)
      if (error.message.includes('duplicate')) {
        setErrors({ submit: 'You have already submitted an entry for this challenge.' })
      } else {
        setErrors({ submit: 'Failed to submit entry. Please try again.' })
      }
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

  if (!challenge || !isMember) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You must be a member of this community to submit entries.
          </p>
          <Button onClick={() => router.push(`/challenges/${params.id}`)}>
            Back to Challenge
          </Button>
        </div>
      </div>
    )
  }

  const isExpired = new Date(challenge.end_date) < new Date()

  if (isExpired) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Challenge Expired</h1>
          <p className="text-gray-600 mb-6">
            This challenge has ended and is no longer accepting submissions.
          </p>
          <Button onClick={() => router.push(`/challenges/${params.id}`)}>
            View Challenge Results
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
        Back to Challenge
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {hasExistingSubmission ? 'Update Submission' : 'Submit Entry'}
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">{challenge.title}</h3>
          <p className="text-blue-800 text-sm">{challenge.description}</p>
        </div>
      </div>

      {/* Submission Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submission Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setSubmissionType('video')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                submissionType === 'video'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={submitting}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium text-gray-900 mb-1">Video Submission</h3>
              <p className="text-sm text-gray-600">
                Submit a pre-recorded video (YouTube link)
              </p>
            </button>

            <button
              onClick={() => setSubmissionType('livestream')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                submissionType === 'livestream'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={submitting}
            >
              <Play className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-medium text-gray-900 mb-1">Livestream</h3>
              <p className="text-sm text-gray-600">
                Submit a livestream link (YouTube Live or Twitch)
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {submissionType === 'video' ? <Upload size={20} /> : <Play size={20} />}
            {submissionType === 'video' ? 'Video' : 'Livestream'} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Submission Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Give your submission a catchy title"
              required
              disabled={submitting}
              error={errors.title}
            />

            {/* Content URL */}
            <div>
              <Input
                label={`${submissionType === 'video' ? 'YouTube Video' : 'Livestream'} URL`}
                name="content_url"
                value={formData.content_url}
                onChange={handleInputChange}
                placeholder={
                  submissionType === 'video'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://www.youtube.com/watch?v=... or https://www.twitch.tv/...'
                }
                required
                disabled={submitting}
                error={errors.content_url}
              />
              <p className="text-sm text-gray-600 mt-1">
                {submissionType === 'video'
                  ? 'Paste the URL of your YouTube video'
                  : 'Paste the URL of your YouTube Live stream or Twitch channel'
                }
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your submission, approach, or any additional context..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Submission Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure your content is relevant to the challenge</li>
                <li>• Make sure your video/stream is publicly accessible</li>
                <li>• Keep content appropriate and respectful</li>
                <li>• You can update your submission until the challenge ends</li>
              </ul>
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
                {submissionType === 'video' ? <Upload size={16} /> : <Play size={16} />}
                {hasExistingSubmission ? 'Update Submission' : 'Submit Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubmitChallengePage() {
  return (
    <ProtectedRoute>
      <SubmitChallengeContent />
    </ProtectedRoute>
  )
}

