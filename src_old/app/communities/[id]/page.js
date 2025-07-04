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
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [membershipLoading, setMembershipLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadCommunityData()
    }
  }, [params.id, user])

  const loadCommunityData = async () => {
    try {
      setLoading(true)
      
      // Load community details
      const communityData = await getCommunityById(params.id)
      setCommunity(communityData)
      
      // Load active challenges for this community
      const challengesData = await getCommunityActiveChallenges(params.id)
      setChallenges(challengesData)
      
      // Check if user is a member
      if (user) {
        const membershipStatus = await isUserMemberOfCommunity(user.id, params.id)
        setIsMember(!!membershipStatus)
      }
    } catch (error) {
      console.error('Error loading community data:', error)
      // Handle 404 or other errors
      router.push('/communities')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLeave = async () => {
    if (!user) return

    setMembershipLoading(true)
    try {
      if (isMember) {
        await leaveCommunity(user.id, params.id)
        setIsMember(false)
        // Update member count
        setCommunity(prev => ({
          ...prev,
          member_count: Math.max((prev.member_count || 0) - 1, 0)
        }))
      } else {
        await joinCommunity(user.id, params.id)
        setIsMember(true)
        // Update member count
        setCommunity(prev => ({
          ...prev,
          member_count: (prev.member_count || 0) + 1
        }))
      }
    } catch (error) {
      console.error('Error updating membership:', error)
    } finally {
      setMembershipLoading(false)
    }
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

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h1>
          <Button onClick={() => router.push('/communities')}>
            Back to Communities
          </Button>
        </div>
      </div>
    )
  }

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

      {/* Community Header */}
      <div className="mb-8">
        {community.image_url && (
          <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-6">
            <img
              src={community.image_url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
              {isMember && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            
            <p className="text-gray-600 text-lg mb-4">{community.description}</p>
            
            {/* Community Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{community.member_count || 0} members</span>
              </div>
              
              {community.leader && (
                <div className="flex items-center gap-1">
                  <Crown size={16} />
                  <span>Led by {community.leader.username}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Target size={16} />
                <span>{challenges.length} active challenges</span>
              </div>
            </div>
          </div>

          {/* Join/Leave Button */}
          {user && (
            <Button
              onClick={handleJoinLeave}
              variant={isMember ? 'outline' : 'primary'}
              size="lg"
              loading={membershipLoading}
              disabled={membershipLoading}
              className="md:min-w-[150px]"
            >
              {isMember ? 'Leave Community' : 'Join Community'}
            </Button>
          )}
          
          {!user && (
            <Button variant="outline" size="lg" disabled>
              Sign in to join
            </Button>
          )}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Challenges</h2>
        
        {challenges.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Challenge Timeline */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Ends {formatRelativeTime(challenge.end_date)}</span>
                      </div>
                      <span>{challenge.submission_count || 0} submissions</span>
                    </div>

                    {/* Action Button */}
                    {isMember ? (
                      <Button 
                        className="w-full"
                        onClick={() => router.push(`/challenges/${challenge.id}`)}
                      >
                        View Challenge
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Join community to participate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Challenges
            </h3>
            <p className="text-gray-600">
              This community doesn't have any active challenges at the moment. 
              Check back later for new challenges!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

