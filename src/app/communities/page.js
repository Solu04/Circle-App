'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getAllCommunities, getUserCommunities } from '@/lib/database'
import CommunityCard from '@/features/community/CommunityCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Loading from '@/components/Loading'

export default function CommunitiesPage() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [userMemberships, setUserMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterJoined, setFilterJoined] = useState(false)

  useEffect(() => {
    loadCommunities()
  }, [user])

  const loadCommunities = async () => {
    try {
      setLoading(true)
      
      // Load all communities
      const allCommunities = await getAllCommunities()
      setCommunities(allCommunities)
      
      // Load user's memberships if logged in
      if (user) {
        const memberships = await getUserCommunities(user.id)
        setUserMemberships(memberships)
      }
    } catch (error) {
      console.error('Error loading communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMembershipChange = (communityId, isNowMember) => {
    // Update local state to reflect membership change
    if (isNowMember) {
      const community = communities.find(c => c.id === communityId)
      if (community) {
        setUserMemberships(prev => [...prev, community])
        // Update member count
        setCommunities(prev => 
          prev.map(c => 
            c.id === communityId 
              ? { ...c, member_count: (c.member_count || 0) + 1 }
              : c
          )
        )
      }
    } else {
      setUserMemberships(prev => prev.filter(c => c.id !== communityId))
      // Update member count
      setCommunities(prev => 
        prev.map(c => 
          c.id === communityId 
            ? { ...c, member_count: Math.max((c.member_count || 0) - 1, 0) }
            : c
        )
      )
    }
  }

  // Filter communities based on search and filter options
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = !filterJoined || 
                         userMemberships.some(membership => membership.id === community.id)
    
    return matchesSearch && matchesFilter
  })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Communities</h1>
        <p className="text-gray-600 max-w-2xl">
          Discover and join communities that match your interests. Participate in weekly challenges 
          and connect with like-minded creators.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {user && (
          <Button
            variant={filterJoined ? 'primary' : 'outline'}
            onClick={() => setFilterJoined(!filterJoined)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            {filterJoined ? 'Show All' : 'My Communities'}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{filteredCommunities.length} communities</span>
        </div>
        
        {user && userMemberships.length > 0 && (
          <div>
            You're a member of {userMemberships.length} communities
          </div>
        )}
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              userMemberships={userMemberships}
              onMembershipChange={handleMembershipChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterJoined ? 'No communities found' : 'No communities available'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.'
              : filterJoined
              ? 'You haven\'t joined any communities yet.'
              : 'Communities will appear here once they\'re created.'
            }
          </p>
          
          {filterJoined && (
            <Button
              variant="outline"
              onClick={() => setFilterJoined(false)}
              className="mt-4"
            >
              Browse All Communities
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

