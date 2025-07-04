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
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState(null)
  
  // Form state
  const [submissionType, setSubmissionType] = useState('video')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    const loadChallenge = async () => {
      if (!id || !user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Load challenge data
        const challengeData = await getChallengeById(id)
        setChallenge(challengeData)
        
        // Check if user is a member of the community
        if (challengeData.community_id) {
          const memberStatus = await isUserMemberOfCommunity(user.id, challengeData.community_id)
          setIsMember(!!memberStatus)
          
          if (!memberStatus) {
            setError('You must be a member of this community to submit entries.')
            return
          }
        }
        
        // Check if user already has a submission for this challenge
        const userSubmissions = await getUserSubmissions(user.id)
        const existing = userSubmissions.find(sub => sub.challenge_id === id)
        if (existing) {
          setExistingSubmission(existing)
          setTitle(existing.title)
          setDescription(existing.description || '')
          setContentUrl(existing.content_url)
          setSubmissionType(existing.submission_type)
        }
        
      } catch (err) {
        console.error('Error loading challenge:', err)
        setError('Failed to load challenge')
      } finally {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [id, user])

  const validateForm = () => {
    const errors = {}
    
    if (!title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!contentUrl.trim()) {
      errors.contentUrl = 'Content URL is required'
    } else if (!isValidUrl(contentUrl)) {
      errors.contentUrl = 'Please enter a valid URL'
    } else if (submissionType === 'video' && !isValidYouTubeUrl(contentUrl)) {
      errors.contentUrl = 'Please enter a valid YouTube URL'
    } else if (submissionType === 'livestream' && !isValidYouTubeUrl(contentUrl) && !isValidTwitchUrl(contentUrl)) {
      errors.contentUrl = 'Please enter a valid YouTube Live or Twitch URL'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSubmitting(true)
      
      const submissionData = {
        challenge_id: id,
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        content_url: contentUrl.trim(),
        submission_type: submissionType
      }
      
      if (existingSubmission) {
        // Update existing submission
        await updateSubmission(existingSubmission.id, submissionData)
      } else {
        // Create new submission
        await createSubmission(submissionData)
      }
      
      // Redirect to challenge page
      router.push(`/challenges/${id}`)
      
    } catch (err) {
      console.error('Error submitting:', err)
      setError('Failed to submit entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>
    )
  }

  if (error || !challenge || !isMember) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cannot Submit Entry</h2>
            <p className="text-gray-600 mb-6">{error || 'You don\'t have permission to submit to this challenge.'}</p>
            <Button onClick={() => router.push(`/challenges/${id}`)}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Challenge
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/challenges/${id}`)}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Challenge
        </Button>

        {/* Challenge info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{challenge.title}</CardTitle>
            <p className="text-gray-600">{challenge.description}</p>
          </CardHeader>
        </Card>

        {/* Submission form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {existingSubmission ? 'Update Your Submission' : 'Submit Your Entry'}
            </CardTitle>
            <p className="text-gray-600">
              {existingSubmission 
                ? 'You can update your submission details below.'
                : 'Share your video or livestream for this challenge.'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Submission type */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Submission Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('video')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      submissionType === 'video'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload size={24} className="text-blue-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Video</h3>
                    <p className="text-sm text-gray-600">Upload a pre-recorded video</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSubmissionType('livestream')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      submissionType === 'livestream'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Play size={24} className="text-red-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Livestream</h3>
                    <p className="text-sm text-gray-600">Share a live stream link</p>
                  </button>
                </div>
              </div>

              {/* Title */}
              <Input
                label="Title"
                required
                placeholder="Enter a title for your submission"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={formErrors.title}
              />

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your submission (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Content URL */}
              <Input
                label={submissionType === 'video' ? 'YouTube Video URL' : 'Stream URL'}
                required
                placeholder={
                  submissionType === 'video'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://www.youtube.com/watch?v=... or https://www.twitch.tv/...'
                }
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                error={formErrors.contentUrl}
              />

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Submission Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make sure your content is relevant to the challenge</li>
                  <li>• {submissionType === 'video' ? 'YouTube videos' : 'YouTube Live and Twitch streams'} are supported</li>
                  <li>• Keep your content appropriate and family-friendly</li>
                  <li>• You can update your submission until the challenge ends</li>
                </ul>
              </div>

              {/* Submit button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Entry'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/challenges/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
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

