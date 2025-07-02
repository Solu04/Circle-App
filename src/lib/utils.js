import { clsx } from 'clsx'

/**
 * Utility function to merge class names
 */
export function cn(...inputs) {
  return clsx(inputs)
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const diffInMs = now - new Date(date)
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return formatDate(date)
}

/**
 * Validate URL format
 */
export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

/**
 * Validate Twitch URL
 */
export function isValidTwitchUrl(url) {
  const twitchRegex = /^(https?:\/\/)?(www\.)?twitch\.tv\/.+/
  return twitchRegex.test(url)
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

