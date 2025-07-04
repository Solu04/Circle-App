'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { 
  getUserCommunities, 
  getUserSubmissions, 
  getUserReputationHistory,
  getUserBadges 
} from '@/lib/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Users, Trophy, Target, Calendar, Award } from 'lucide-react'
import Loading from '@/components/Loading'
import ProtectedRoute from '@/components/ProtectedRoute'
import { formatDate, formatRelativeTime } from '@/lib/utils'

function ProfileContent() {
  const { user, profile } = useAuth()
  const [userCommunities, setUserCommunities] = useState([])
  const [userSubmissions, setUserSubmissions] = useState([])
  const [reputationHistory, setReputationHistory] = useState([])
  const [userBadges, setUserBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      const [communities, submissions, reputation, badges] = await Promise.all([
        getUserCommunities(user.id),
        getUserSubmissions(user.id),
        getUserReputationHistory(user.id),
        getUserBadges(user.id)
      ])
      
      setUserCommunities(communities)
      setUserSubmissions(submissions)
      setReputationHistory(reputation)
      setUserBadges(badges)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Users },
    { id: 'communities', name: 'Communities', icon: Users },
    { id: 'submissions', name: 'Submissions', icon: Target },
    { id: 'reputation', name: 'Reputation', icon: Trophy },
    { id: 'badges', name: 'Badges', icon: Award }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || profile.username}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
              <Users size={32} className="text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile?.full_name || profile?.username || 'User'}
            </h1>
            <p className="text-gray-600 mb-4">@{profile?.username}</p>
            
            {profile?.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                <span>{profile?.reputation_points || 0} reputation</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{userCommunities.length} communities</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={16} />
                <span>{userSubmissions.length} submissions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {userSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {userSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{submission.title}</p>
                        <p className="text-sm text-gray-600">
                          {submission.challenge?.title} • {formatRelativeTime(submission.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-medium">
                    {userSubmissions.reduce((sum, sub) => sum + (sub.vote_count || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Badges Earned</span>
                  <span className="font-medium">{userBadges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {formatDate(profile?.created_at || user.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'communities' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCommunities.map((community) => (
            <Card key={community.id}>
              <CardHeader>
                {community.image_url && (
                  <div className="w-full h-32 mb-4 rounded-md overflow-hidden">
                    <img
                      src={community.image_url}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{community.member_count || 0} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {userCommunities.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Communities Yet
              </h3>
              <p className="text-gray-600">
                Join communities to start participating in challenges.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {userSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{submission.title}</CardTitle>
                    <CardDescription>
                      {submission.challenge?.title} • {formatRelativeTime(submission.created_at)}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{submission.vote_count || 0} votes</div>
                    <div>{submission.view_count || 0} views</div>
                  </div>
                </div>
              </CardHeader>
              {submission.description && (
                <CardContent>
                  <p className="text-gray-700">{submission.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
          
          {userSubmissions.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Participate in challenges to create your first submission.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reputation' && (
        <div className="space-y-4">
          {reputationHistory.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{entry.reason}</p>
                    <p className="text-sm text-gray-600">
                      {formatRelativeTime(entry.created_at)}
                    </p>
                  </div>
                  <div className={`font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.points > 0 ? '+' : ''}{entry.points}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {reputationHistory.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Reputation History
              </h3>
              <p className="text-gray-600">
                Earn reputation by participating in challenges and receiving votes.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBadges.map((userBadge) => (
            <Card key={userBadge.id}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>{userBadge.badge.name}</CardTitle>
                <CardDescription>{userBadge.badge.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">
                  Earned {formatRelativeTime(userBadge.earned_at)}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {userBadges.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Badges Yet
              </h3>
              <p className="text-gray-600">
                Complete challenges and engage with the community to earn badges.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

