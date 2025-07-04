"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Target, Calendar, Users, Trophy, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getActiveChallenges,
  getUserCommunities,
  getChallengesByUser,
} from "@/lib/database";
import ChallengeCard from "@/features/challenges/ChallengeCard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Loading from "@/components/Loading";
import Link from "next/link";

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all active challenges
      const activeChallenges = await getActiveChallenges();
      setChallenges(activeChallenges || []);

      // Load user's communities if authenticated
      if (user) {
        try {
          const userComms = await getUserCommunities(user.id);
          setUserCommunities(userComms || []);
        } catch (userCommError) {
          console.error("Error loading user communities:", userCommError);
          setUserCommunities([]);
        }
      }
    } catch (err) {
      console.error("Error loading challenges:", err);
      setError("Failed to load challenges. Please try again.");
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const filteredChallenges = challenges.filter(
    (challenge) =>
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.community?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter challenges based on user's community membership
  const userCommunityIds = userCommunities.map((uc) => uc.community_id);
  const relevantChallenges = user
    ? filteredChallenges.filter((challenge) =>
        userCommunityIds.includes(challenge.community_id)
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Active Challenges
              </h1>
              <p className="mt-2 text-gray-600">
                Discover exciting challenges from communities you've joined.
                Submit your livestreams or videos to showcase your skills and
                compete with other creators.
              </p>
            </div>

            {user && userCommunities.length > 0 && (
              <Link href="/challenges/create">
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Create Challenge
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Target size={16} />
              <span>{challenges.length} active challenges</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <Trophy size={16} />
                <span>{relevantChallenges.length} available to you</span>
              </div>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={loadChallenges} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {/* No user state */}
        {!user && (
          <div className="text-center py-12">
            <Target size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign in to see challenges
            </h3>
            <p className="text-gray-600 mb-6">
              Join communities and participate in exciting weekly challenges.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">Sign In</Button>
              <Button>Sign Up</Button>
            </div>
          </div>
        )}

        {/* No communities state */}
        {user && userCommunities.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Join communities first
            </h3>
            <p className="text-gray-600 mb-6">
              You need to join communities to see and participate in their
              challenges.
            </p>
            <Link href="/communities">
              <Button>
                <Users size={16} className="mr-2" />
                Join Communities
              </Button>
            </Link>
          </div>
        )}

        {/* No challenges state */}
        {user &&
          userCommunities.length > 0 &&
          relevantChallenges.length === 0 &&
          !searchTerm && (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No active challenges
              </h3>
              <p className="text-gray-600 mb-6">
                There are no active challenges at the moment.
              </p>
              <Link href="/challenges/create">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Create Challenge
                </Button>
              </Link>
            </div>
          )}

        {/* Search no results */}
        {user && searchTerm && filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No challenges found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or browse all challenges.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Challenges grid */}
        {user && relevantChallenges.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relevantChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                showSubmitButton={true}
              />
            ))}
          </div>
        )}

        {/* All challenges for non-members */}
        {!user && filteredChallenges.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                showSubmitButton={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
