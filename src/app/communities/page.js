"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  Crown,
  Calendar,
  CheckCircle,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  isUserMemberOfCommunity,
} from "@/lib/database";
import CommunityCard from "@/features/community/CommunityCard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Loading from "@/components/Loading";
import Link from "next/link";

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipStatus, setMembershipStatus] = useState({});

  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all communities
      const allCommunities = await getAllCommunities();
      setCommunities(allCommunities || []);

      // Load user's communities if authenticated
      if (user) {
        try {
          const userComms = await getUserCommunities(user.id);
          setUserCommunities(userComms || []);

          // Check membership status for each community
          const statusMap = {};
          for (const community of allCommunities || []) {
            try {
              const isMember = await isUserMemberOfCommunity(
                user.id,
                community.id
              );
              statusMap[community.id] = !!isMember;
            } catch (err) {
              console.error(
                `Error checking membership for community ${community.id}:`,
                err
              );
              statusMap[community.id] = false;
            }
          }
          setMembershipStatus(statusMap);
        } catch (userCommError) {
          console.error("Error loading user communities:", userCommError);
          setUserCommunities([]);
        }
      }
    } catch (err) {
      console.error("Error loading communities:", err);
      setError("Failed to load communities. Please try again.");
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const handleJoinLeave = async (communityId) => {
    if (!user) return;

    try {
      const isMember = membershipStatus[communityId];

      if (isMember) {
        await leaveCommunity(user.id, communityId);
        setMembershipStatus((prev) => ({ ...prev, [communityId]: false }));

        // Update community member count
        setCommunities((prev) =>
          prev.map((community) =>
            community.id === communityId
              ? { ...community, member_count: community.member_count - 1 }
              : community
          )
        );
      } else {
        await joinCommunity(user.id, communityId);
        setMembershipStatus((prev) => ({ ...prev, [communityId]: true }));

        // Update community member count
        setCommunities((prev) =>
          prev.map((community) =>
            community.id === communityId
              ? { ...community, member_count: community.member_count + 1 }
              : community
          )
        );
      }

      // Reload user communities
      if (user) {
        const userComms = await getUserCommunities(user.id);
        setUserCommunities(userComms || []);
      }
    } catch (err) {
      console.error("Error joining/leaving community:", err);
    }
  };

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-64">
            <Loading size="lg" />
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
              <p className="mt-2 text-gray-600">
                Discover and join communities that match your interests.
                Participate in weekly challenges and connect with like-minded
                creators.
              </p>
            </div>

            {user && (
              <Link href="/communities/create">
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Create Community
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
              placeholder="Search communities..."
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
              <Users size={16} />
              <span>{communities.length} communities</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>You're in {userCommunities.length} communities</span>
              </div>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={loadCommunities}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Communities grid */}
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No communities found" : "No communities available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms or browse all communities."
                : "Communities will appear here once they're created."}
            </p>
            {user && !searchTerm && (
              <Link href="/communities/create">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Create the First Community
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isMember={membershipStatus[community.id] || false}
                onJoinLeave={() => handleJoinLeave(community.id)}
                showJoinButton={!!user}
              />
            ))}
          </div>
        )}

        {/* Call to Action for Non-Authenticated Users */}
        {!user && communities.length > 0 && (
          <div className="mt-12 text-center bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Join the Community?
            </h3>
            <p className="text-gray-600 mb-6">
              Sign up to join communities, participate in challenges, and
              connect with creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Sign Up to Join Communities</Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
