'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  Trophy, 
  ArrowLeft, 
  Play,
  ThumbsUp,
  Eye,
  Plus
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { 
  getChallengeById, 
  getChallengeSubmissions,
  isUserMemberOfCommunity,
  hasUserVoted,
  voteForSubmission,
  removeVote
} from '@/lib/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [userVotes, setUserVotes] = useState(new Set())
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [votingLoading, setVotingLoading] = useState(new Set())

  useEffect(() => {
    if (params.id) {
      loadChallengeData()
    }
  }, [params.id, user])

  const loadChallengeData = async () => {
    try {
      setLoading(true)
      
      // Load challenge details
      const challengeData = await getChallengeById(params.id)
      setChallenge(challengeData)
      
      // Load submissions for this challenge
      const submissionsData = await getChallengeSubmissions(params.id)
      setSubmissions(submissionsData)
      
      // Check if user is a member of the community
      if (user && challengeData) {
        const membershipStatus = await isUserMemberOfCommunity(user.id, challengeData.community_id)
        setIsMember(!!membershipStatus)
        
        // Load user's votes for these submissions
        const votes = new Set()
        for (const submission of submissionsData) {
          const hasVoted = await hasUserVoted(user.id, submission.id)
          if (hasVoted) {
            votes.add(submission.id)
          }
        }
        setUserVotes(votes)
      }
    } catch (error) {
      console.error('Error loading challenge data:', error)
      router.push('/challenges')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (submissionId) => {
    if (!user || !isMember) return

    setVotingLoading(prev => new Set(prev).add(submissionId))
    
    try {
      const hasVoted = userVotes.has(submissionId)
      
      if (hasVoted) {
        await removeVote(user.id, submissionId)
        setUserVotes(prev => {
          const newVotes = new Set(prev)
          newVotes.delete(submissionId)
          return newVotes
        })
        // Update submission vote count
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === submissionId 
              ? { ...sub, vote_count: Math.max((sub.vote_count || 0) - 1, 0) }
              : sub
          )
        )
      } else {
        await voteForSubmission(user.id, submissionId)
        setUserVotes(prev => new Set(prev).add(submissionId))
        // Update submission vote count
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === submissionId 
              ? { ...sub, vote_count: (sub.vote_count || 0) + 1 }
              : sub
          )
        )
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingLoading(prev => {
        const newLoading = new Set(prev)
        newLoading.delete(submissionId)
        return newLoading
      })
    }
  }

  const getVideoEmbedUrl = (url) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    
    // For other URLs, return as is (might be direct video links)
    return url
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Challenge Not Found</h1>
          <Button onClick={() => router.push('/challenges')}>
            Back to Challenges
          </Button>
        </div>
      </div>
    )
  }

  const isActive = challenge.status === 'active'
  const isExpired = new Date(challenge.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      {/* Challenge Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
              {isActive && !isExpired && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              )}
              {isExpired && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Expired
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-lg mb-6">{challenge.description}</p>
            
            {/* Challenge Info */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{challenge.community?.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Started {formatRelativeTime(challenge.start_date)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {isExpired ? 'Ended' : 'Ends'} {formatDate(challenge.end_date)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target size={16} />
                <span>{submissions.length} submissions</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {user && isMember && isActive && !isExpired && (
            <Button
              size="lg"
              onClick={() => router.push(`/challenges/${challenge.id}/submit`)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Submit Entry
            </Button>
          )}
          
          {!user && (
            <Button variant="outline" size="lg" disabled>
              Sign in to participate
            </Button>
          )}
          
          {user && !isMember && (
            <Button variant="outline" size="lg" disabled>
              Join community to participate
            </Button>
          )}
        </div>
      </div>

      {/* Submissions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Submissions ({submissions.length})
        </h2>
        
        {submissions.length > 0 ? (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Video/Content Preview */}
                  <div className="md:w-1/3">
                    {submission.submission_type === 'video' && submission.content_url && (
                      <div className="aspect-video">
                        <iframe
                          src={getVideoEmbedUrl(submission.content_url)}
                          className="w-full h-full"
                          allowFullScreen
                          title={submission.title}
                        />
                      </div>
                    )}
                    
                    {submission.submission_type === 'livestream' && (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">Livestream</p>
                          <a
                            href={submission.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Watch Live
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Submission Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {submission.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{submission.user?.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatRelativeTime(submission.created_at)}</span>
                          </div>
                        </div>
                        
                        {submission.description && (
                          <p className="text-gray-700 mb-4">{submission.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Voting and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{submission.view_count || 0} views</span>
                        </div>
                      </div>
                      
                      {user && isMember && (
                        <Button
                          variant={userVotes.has(submission.id) ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleVote(submission.id)}
                          loading={votingLoading.has(submission.id)}
                          disabled={votingLoading.has(submission.id)}
                          className="flex items-center gap-2"
                        >
                          <ThumbsUp size={14} />
                          <span>{submission.vote_count || 0}</span>
                        </Button>
                      )}
                      
                      {(!user || !isMember) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ThumbsUp size={14} />
                          <span>{submission.vote_count || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to submit your entry for this challenge!
            </p>
            
            {user && isMember && isActive && !isExpired && (
              <Button
                onClick={() => router.push(`/challenges/${challenge.id}/submit`)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Submit Entry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

