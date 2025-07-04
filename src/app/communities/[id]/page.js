'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users, Crown, Calendar, Target, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { 
  getCommunityById, 
  getCommunityActiveChallenges,
  isUserMemberOfCommunity,
  joinCommunity,
  leaveCommunity 
} from '@/lib/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function CommunityPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [community, setCommunity] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMember, setIsMember] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const loadCommunity = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Load community data
        const communityData = await getCommunityById(params.id)
        setCommunity(communityData)
        
        // Load active challenges
        const challengesData = await getCommunityActiveChallenges(params.id)
        setChallenges(challengesData)
        
        // Check membership status
        if (user) {
          const memberStatus = await isUserMemberOfCommunity(user.id, params.id)
          setIsMember(!!memberStatus)
        }
        
      } catch (err) {
        console.error('Error loading community:', err)
        setError('Failed to load community')
      } finally {
        setLoading(false)
      }
    }

    loadCommunity()
  }, [params.id, user])

  const handleJoinLeave = async () => {
    if (!user) return
    
    try {
      setJoining(true)
      
      if (isMember) {
        await leaveCommunity(user.id, params.id)
        setIsMember(false)
        // Update member count
        setCommunity(prev => ({
          ...prev,
          member_count: prev.member_count - 1
        }))
      } else {
        await joinCommunity(user.id, params.id)
        setIsMember(true)
        // Update member count
        setCommunity(prev => ({
          ...prev,
          member_count: prev.member_count + 1
        }))
      }
    } catch (err) {
      console.error('Error joining/leaving community:', err)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>
    )
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The community you\'re looking for doesn\'t exist.'}</p>
            <Button onClick={() => router.push('/communities')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Communities
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/communities')}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Communities
        </Button>

        {/* Community header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              {community.image_url && (
                <img
                  src={community.image_url}
                  alt={community.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
                <p className="text-gray-600 text-lg mb-4">{community.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    {community.member_count} members
                  </div>
                  <div className="flex items-center">
                    <Crown size={16} className="mr-2" />
                    Led by {community.leader?.username || 'Unknown'}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    Created {formatDate(community.created_at)}
                  </div>
                </div>
              </div>
            </div>
            
            {user && (
              <div className="lg:flex-shrink-0">
                <Button
                  onClick={handleJoinLeave}
                  disabled={joining}
                  variant={isMember ? 'outline' : 'default'}
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  {joining ? (
                    'Processing...'
                  ) : isMember ? (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Leave Community
                    </>
                  ) : (
                    'Join Community'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active challenges */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Active Challenges ({challenges.length})
          </h2>
          
          {challenges.length === 0 ? (
            <Card className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active challenges</h3>
              <p className="text-gray-600 mb-6">This community doesn't have any active challenges at the moment.</p>
              {user && community.leader_id === user.id && (
                <Button onClick={() => router.push('/challenges/create')}>
                  Create Challenge
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/challenges/${challenge.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(challenge.end_date)}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Ends {formatDate(challenge.end_date)}
                      </div>
                      <div className="flex items-center">
                        <Target size={14} className="mr-1" />
                        {challenge.submission_count || 0} submissions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

