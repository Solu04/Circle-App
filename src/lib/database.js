import { supabase } from './supabase'

// User operations
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) throw error
  return data
}

// Community operations
export const getAllCommunities = async () => {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      leader:profiles!communities_leader_id_fkey(username, full_name, avatar_url)
    `)
    .eq('is_active', true)
    .order('member_count', { ascending: false })
  
  if (error) throw error
  return data
}

export const getCommunityById = async (communityId) => {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      leader:profiles!communities_leader_id_fkey(username, full_name, avatar_url)
    `)
    .eq('id', communityId)
    .single()
  
  if (error) throw error
  return data
}

export const getUserCommunities = async (userId) => {
  const { data, error } = await supabase
    .from('community_memberships')
    .select(`
      community:communities(*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data.map(item => item.community)
}

export const joinCommunity = async (userId, communityId) => {
  const { data, error } = await supabase
    .from('community_memberships')
    .insert({ user_id: userId, community_id: communityId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const leaveCommunity = async (userId, communityId) => {
  const { error } = await supabase
    .from('community_memberships')
    .delete()
    .eq('user_id', userId)
    .eq('community_id', communityId)
  
  if (error) throw error
  return true
}

export const isUserMemberOfCommunity = async (userId, communityId) => {
  const { data, error } = await supabase
    .from('community_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .single()
  
  return !error && data
}

// Challenge operations
export const getActiveChallenges = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      community:communities(name, image_url),
      creator:profiles!challenges_created_by_fkey(username, full_name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getCommunityActiveChallenges = async (communityId) => {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      community:communities(name, image_url),
      creator:profiles!challenges_created_by_fkey(username, full_name)
    `)
    .eq('community_id', communityId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getChallengeById = async (challengeId) => {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      *,
      community:communities(name, image_url),
      creator:profiles!challenges_created_by_fkey(username, full_name)
    `)
    .eq('id', challengeId)
    .single()
  
  if (error) throw error
  return data
}

export const createChallenge = async (challengeData) => {
  const { data, error } = await supabase
    .from('challenges')
    .insert(challengeData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Submission operations
export const getChallengeSubmissions = async (challengeId) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      user:profiles(username, full_name, avatar_url),
      challenge:challenges(title)
    `)
    .eq('challenge_id', challengeId)
    .order('vote_count', { ascending: false })
  
  if (error) throw error
  return data
}

export const getUserSubmissions = async (userId) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      challenge:challenges(title, community:communities(name))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createSubmission = async (submissionData) => {
  const { data, error } = await supabase
    .from('submissions')
    .insert(submissionData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateSubmission = async (submissionId, updates) => {
  const { data, error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', submissionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteSubmission = async (submissionId) => {
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId)
  
  if (error) throw error
  return true
}

// Voting operations
export const voteForSubmission = async (userId, submissionId) => {
  const { data, error } = await supabase
    .from('votes')
    .insert({ user_id: userId, submission_id: submissionId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const removeVote = async (userId, submissionId) => {
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('user_id', userId)
    .eq('submission_id', submissionId)
  
  if (error) throw error
  return true
}

export const hasUserVoted = async (userId, submissionId) => {
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', userId)
    .eq('submission_id', submissionId)
    .single()
  
  return !error && data
}

// Reputation operations
export const addReputationPoints = async (userId, points, reason, relatedSubmissionId = null, relatedChallengeId = null) => {
  // Add to reputation history
  const { error: historyError } = await supabase
    .from('reputation_history')
    .insert({
      user_id: userId,
      points,
      reason,
      related_submission_id: relatedSubmissionId,
      related_challenge_id: relatedChallengeId
    })
  
  if (historyError) throw historyError
  
  // Update user's total reputation
  const { data, error } = await supabase
    .from('profiles')
    .update({ reputation_points: supabase.raw(`reputation_points + ${points}`) })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUserReputationHistory = async (userId) => {
  const { data, error } = await supabase
    .from('reputation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Notification operations
export const getUserNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw error
  return data
}

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const createNotification = async (notificationData) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Badge operations
export const getUserBadges = async (userId) => {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const checkAndAwardBadges = async (userId) => {
  // This function would check if user qualifies for any new badges
  // and award them automatically. Implementation would depend on specific badge criteria.
  
  const userProfile = await getUserProfile(userId)
  const userSubmissions = await getUserSubmissions(userId)
  
  // Example: Check for "First Challenge" badge
  if (userSubmissions.length === 1) {
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', 'first-challenge-badge-id')
      .single()
    
    if (!existingBadge) {
      // Award the badge
      await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: 'first-challenge-badge-id'
        })
    }
  }
  
  // Add more badge checks here...
}

