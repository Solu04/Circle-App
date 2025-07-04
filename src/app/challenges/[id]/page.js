"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getChallengeById,
  getChallengeSubmissions,
  isUserMemberOfCommunity,
  voteForSubmission,
  removeVote,
  hasUserVoted,
} from "@/lib/database";
import Button from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedRoute";

const ChallengePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [userVotes, setUserVotes] = useState(new Set());

  const loadChallenge = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const challengeData = await getChallengeById(id);
      setChallenge(challengeData);

      // Check if user is a member of the community
      if (user && challengeData.community_id) {
        const memberStatus = await isUserMemberOfCommunity(
          user.id,
          challengeData.community_id
        );
        setIsMember(!!memberStatus);
      }

      // Load submissions
      const submissionsData = await getChallengeSubmissions(id);
      setSubmissions(submissionsData);

      // Load user votes if authenticated
      if (user) {
        const votes = new Set();
        for (const submission of submissionsData) {
          const voted = await hasUserVoted(user.id, submission.id);
          if (voted) {
            votes.add(submission.id);
          }
        }
        setUserVotes(votes);
      }
    } catch (err) {
      console.error("Error loading challenge:", err);
      setError("Failed to load challenge");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  const handleVote = async (submissionId) => {
    if (!user || !isMember) return;

    try {
      const hasVoted = userVotes.has(submissionId);

      if (hasVoted) {
        await removeVote(user.id, submissionId);
        setUserVotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(submissionId);
          return newSet;
        });
      } else {
        await voteForSubmission(user.id, submissionId);
        setUserVotes((prev) => new Set([...prev, submissionId]));
      }

      // Reload submissions to get updated vote counts
      const submissionsData = await getChallengeSubmissions(id);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "expired":
        return "text-red-600 bg-red-100";
      case "upcoming":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getYouTubeVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Challenge Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The challenge you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.push("/challenges")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Challenges
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysLeft(challenge.end_date);
  const isActive = challenge.status === "active";
  const canSubmit = user && isMember && isActive && daysLeft > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/challenges")}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Challenges
        </Button>

        {/* Challenge header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    challenge.status
                  )}`}
                >
                  {challenge.status.charAt(0).toUpperCase() +
                    challenge.status.slice(1)}
                </span>
                {isActive && (
                  <span className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-1" />
                    {daysLeft > 0 ? `${daysLeft} days left` : "Ends today"}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {challenge.title}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                {challenge.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  {challenge.community?.name}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {new Date(challenge.start_date).toLocaleDateString()} -{" "}
                  {new Date(challenge.end_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Target size={16} className="mr-2" />
                  {submissions.length} submissions
                </div>
              </div>
            </div>

            {canSubmit && (
              <div className="lg:flex-shrink-0">
                <Button
                  onClick={() => router.push(`/challenges/${id}/submit`)}
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  <Plus size={16} className="mr-2" />
                  Submit Entry
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Submissions ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <Card className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to submit your entry for this challenge!
              </p>
              {canSubmit && (
                <Button onClick={() => router.push(`/challenges/${id}/submit`)}>
                  <Plus size={16} className="mr-2" />
                  Submit Entry
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission) => {
                const videoId =
                  submission.submission_type === "video"
                    ? getYouTubeVideoId(submission.content_url)
                    : null;
                const hasUserVoted = userVotes.has(submission.id);

                return (
                  <Card key={submission.id} className="overflow-hidden">
                    {/* Video/Stream preview */}
                    <div className="aspect-video bg-gray-100 relative">
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={submission.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Submission info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {submission.title}
                      </h3>
                      {submission.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs text-white font-medium">
                              {submission.user?.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          {submission.user?.username}
                        </div>

                        {user && isMember && (
                          <button
                            onClick={() => handleVote(submission.id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                              hasUserVoted
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <ThumbsUp size={14} />
                            {submission.vote_count || 0}
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <a
                          href={submission.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View{" "}
                          {submission.submission_type === "livestream"
                            ? "Stream"
                            : "Video"}
                        </a>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
