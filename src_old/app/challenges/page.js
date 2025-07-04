'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Target, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getActiveChallenges, getUserCommunities } from '@/lib/database'
import ChallengeCard from '@/features/challenges/ChallengeCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Loading from '@/components/Loading'

export default function ChallengesPage() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [userCommunities, setUserCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMyCommunities, setFilterMyCommunities] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [user])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      
      // Load all active challenges
      const allChallenges = await getActiveChallenges()
      setChallenges(allChallenges)
      
      // Load user's communities if logged in
      if (user) {
        const memberships = await getUserCommunities(user.id)
        setUserCommunities(memberships)
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter challenges based on search and filter options
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.community?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = !filterMyCommunities || 
                         userCommunities.some(community => community.id === challenge.community_id)
    
    return matchesSearch && matchesFilter
  })

  // Check if user is member of challenge's community
  const isUserMemberOfCommunity = (communityId) => {
    return userCommunities.some(community => community.id === communityId)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Active Challenges</h1>
        <p className="text-gray-600 max-w-2xl">
          Discover exciting challenges from communities you've joined. Submit your livestreams 
          or videos to showcase your skills and compete with other creators.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {user && userCommunities.length > 0 && (
          <Button
            variant={filterMyCommunities ? 'primary' : 'outline'}
            onClick={() => setFilterMyCommunities(!filterMyCommunities)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            {filterMyCommunities ? 'Show All' : 'My Communities'}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Target size={16} />
          <span>{filteredChallenges.length} active challenges</span>
        </div>
        
        {user && userCommunities.length > 0 && (
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>
              {filteredChallenges.filter(c => isUserMemberOfCommunity(c.community_id)).length} 
              {' '}from your communities
            </span>
          </div>
        )}
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              showCommunity={true}
              userIsMember={isUserMemberOfCommunity(challenge.community_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterMyCommunities ? 'No challenges found' : 'No active challenges'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.'
              : filterMyCommunities
              ? 'Your communities don\'t have any active challenges right now.'
              : 'There are no active challenges at the moment.'
            }
          </p>
          
          {filterMyCommunities && (
            <Button
              variant="outline"
              onClick={() => setFilterMyCommunities(false)}
              className="mr-4"
            >
              Browse All Challenges
            </Button>
          )}
          
          {!user && (
            <Button onClick={() => window.location.href = '/communities'}>
              Join Communities
            </Button>
          )}
          
          {user && userCommunities.length === 0 && (
            <Button onClick={() => window.location.href = '/communities'}>
              Join Communities
            </Button>
          )}
        </div>
      )}

      {/* Call to Action for Non-Members */}
      {user && filteredChallenges.length > 0 && (
        <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Want to participate in more challenges?
          </h3>
          <p className="text-gray-600 mb-4">
            Join more communities to unlock additional weekly challenges and expand your creative horizons.
          </p>
          <Button onClick={() => window.location.href = '/communities'}>
            Browse Communities
          </Button>
        </div>
      )}
    </div>
  )
}

