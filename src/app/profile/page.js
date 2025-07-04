"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Trophy,
  Users,
  Target,
  Calendar,
  Edit,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserCommunities,
  getUserSubmissions,
  getUserBadges,
  updateUserProfile,
} from "@/lib/database";
import Button from "@/components/Button";
import { Card } from "@/components/Card";
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

function ProfileContent() {
  const { user, profile, refetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("communities");
  const [communities, setCommunities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    full_name: "",
    bio: "",
  });

  const loadProfileData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load user's communities
      try {
        const userCommunities = await getUserCommunities(user.id);
        setCommunities(userCommunities || []);
      } catch (commError) {
        console.error("Error loading communities:", commError);
        setCommunities([]);
      }

      // Load user's submissions
      try {
        const userSubmissions = await getUserSubmissions(user.id);
        setSubmissions(userSubmissions || []);
      } catch (subError) {
        console.error("Error loading submissions:", subError);
        setSubmissions([]);
      }

      // Load user's badges
      try {
        const userBadges = await getUserBadges(user.id);
        setBadges(userBadges || []);
      } catch (badgeError) {
        console.error("Error loading badges:", badgeError);
        setBadges([]);
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUserProfile(user.id, editForm);
      await refetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const tabs = [
    {
      id: "communities",
      label: "Communities",
      icon: Users,
      count: communities.length,
    },
    {
      id: "submissions",
      label: "Submissions",
      icon: Target,
      count: submissions.length,
    },
    { id: "badges", label: "Badges", icon: Trophy, count: badges.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                )}

                <div className="flex-1">
                  {isEditing ? (
                    <form onSubmit={handleEditProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              full_name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile?.full_name || profile?.username || "User"}
                      </h1>
                      <p className="text-gray-600">@{profile?.username}</p>
                      {profile?.bio && (
                        <p className="mt-2 text-gray-700">{profile.bio}</p>
                      )}

                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Trophy size={16} />
                          <span>
                            {profile?.reputation_points || 0} reputation
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>
                            Joined{" "}
                            {new Date(
                              profile?.created_at || user?.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={loadProfileData}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "communities" && (
            <div>
              {communities.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No communities joined
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Join communities to participate in challenges and connect
                    with creators.
                  </p>
                  <Link href="/communities">
                    <Button>
                      <Users size={16} className="mr-2" />
                      Browse Communities
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {communities.map((membership) => (
                    <Card key={membership.community_id} className="p-4">
                      <div className="flex items-center gap-3">
                        {membership.community?.image_url && (
                          <img
                            src={membership.community.image_url}
                            alt={membership.community.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {membership.community?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Joined{" "}
                            {new Date(
                              membership.joined_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/communities/${membership.community_id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "submissions" && (
            <div>
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Target size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Participate in challenges to showcase your skills and
                    creativity.
                  </p>
                  <Link href="/challenges">
                    <Button>
                      <Target size={16} className="mr-2" />
                      Browse Challenges
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {submission.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {submission.challenge?.title}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{submission.vote_count || 0} votes</span>
                            <span>
                              {new Date(
                                submission.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href={`/challenges/${submission.challenge_id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "badges" && (
            <div>
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No badges earned
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Participate in challenges and build your reputation to earn
                    badges.
                  </p>
                  <Link href="/challenges">
                    <Button>
                      <Trophy size={16} className="mr-2" />
                      Start Earning
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {badges.map((badge) => (
                    <Card key={badge.id} className="p-4 text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Trophy size={24} className="text-yellow-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">
                        {badge.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {badge.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
