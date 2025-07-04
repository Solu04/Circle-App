'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, Target, Clock, Trophy, Zap, Timer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import Button from '@/components/Button'
import { formatDate, formatRelativeTime } from '@/lib/utils'

const ChallengeCard = ({ challenge, showCommunity = true, userIsMember = false }) => {
  const isActive = challenge.status === 'active'
  const isExpired = new Date(challenge.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))

  const getStatusConfig = () => {
    if (isExpired) return {
      color: 'text-red-600 bg-red-50 border-red-200',
      text: 'Expired',
      icon: Clock
    }
    if (daysLeft <= 1) return {
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      text: daysLeft === 0 ? 'Ends today' : '1 day left',
      icon: Timer
    }
    if (daysLeft <= 3) return {
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      text: `${daysLeft} days left`,
      icon: Timer
    }
    return {
      color: 'text-green-600 bg-green-50 border-green-200',
      text: `${daysLeft} days left`,
      icon: Zap
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <Card hover className="h-full group overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {challenge.title}
            </CardTitle>
            {showCommunity && challenge.community && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Users size={14} className="text-blue-500" />
                <span className="font-medium">{challenge.community.name}</span>
              </div>
            )}
          </div>
          
          {isActive && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
              <StatusIcon size={12} />
              <span>{statusConfig.text}</span>
            </div>
          )}
        </div>
        
        <CardDescription className="line-clamp-3 leading-relaxed">
          {challenge.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Challenge Timeline */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-green-500" />
                <span>Started {formatRelativeTime(challenge.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} className="text-blue-500" />
                <span>Ends {formatDate(challenge.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Challenge Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Target size={14} className="text-purple-500" />
              <span className="font-medium">{challenge.submission_count || 0}</span>
              <span>submissions</span>
            </div>
            
            {challenge.creator && (
              <div className="flex items-center gap-1 text-gray-600">
                <Trophy size={14} className="text-yellow-500" />
                <span className="font-medium">{challenge.creator.username}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {userIsMember || !showCommunity ? (
              <Link href={`/challenges/${challenge.id}`} className="block">
                <Button className="w-full group-hover:scale-105 transition-transform duration-200">
                  {isActive ? (
                    <>
                      <Zap size={16} className="mr-2" />
                      View Challenge
                    </>
                  ) : (
                    <>
                      <Trophy size={16} className="mr-2" />
                      View Results
                    </>
                  )}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Join community to participate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChallengeCard

