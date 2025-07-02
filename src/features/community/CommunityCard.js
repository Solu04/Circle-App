'use client'

import { useState } from 'react'
import { Users, Crown, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { useAuth } from '@/context/AuthContext'
import { joinCommunity, leaveCommunity } from '@/lib/database'

const CommunityCard = ({ community, userMemberships = [], onMembershipChange }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isMember, setIsMember] = useState(
    userMemberships.some(membership => membership.id === community.id)
  )

  const handleJoinLeave = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (isMember) {
        await leaveCommunity(user.id, community.id)
        setIsMember(false)
      } else {
        await joinCommunity(user.id, community.id)
        setIsMember(true)
      }
      
      // Notify parent component of membership change
      if (onMembershipChange) {
        onMembershipChange(community.id, !isMember)
      }
    } catch (error) {
      console.error('Error updating membership:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card hover className="h-full group overflow-hidden">
      <CardHeader className="relative">
        {community.image_url && (
          <div className="w-full h-32 mb-4 rounded-lg overflow-hidden relative">
            <img
              src={community.image_url}
              alt={community.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors duration-200">
              {community.name}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {community.description}
            </CardDescription>
          </div>
          
          {isMember && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium ml-2">
              <CheckCircle size={12} />
              <span>Joined</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Community Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users size={16} className="text-blue-500" />
              <span className="font-medium">{community.member_count || 0}</span>
              <span>members</span>
            </div>
            
            {community.leader && (
              <div className="flex items-center gap-1">
                <Crown size={16} className="text-yellow-500" />
                <span className="font-medium">{community.leader.username}</span>
              </div>
            )}
          </div>

          {/* Join/Leave Button */}
          {user && (
            <Button
              onClick={handleJoinLeave}
              variant={isMember ? 'outline' : 'primary'}
              className="w-full transition-all duration-200"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                'Processing...'
              ) : isMember ? (
                'Leave Community'
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Join Community
                </>
              )}
            </Button>
          )}
          
          {!user && (
            <Button variant="outline" className="w-full" disabled>
              Sign in to join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityCard

