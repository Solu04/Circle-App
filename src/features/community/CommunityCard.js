"use client";

import { useState } from "react";
import { Users, Crown, CheckCircle, Sparkles, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const CommunityCard = ({
  community,
  isMember = false,
  onJoinLeave,
  showJoinButton = true,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleJoinLeave = async () => {
    if (!user || !onJoinLeave) return;

    setLoading(true);
    try {
      await onJoinLeave(community.id);
    } catch (error) {
      console.error("Error updating membership:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the community leader
  const isLeader = user && community.leader_id === user.id;

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

          {/* Membership Status Badge */}
          {isMember && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium ml-2">
              <CheckCircle size={12} />
              <span>{isLeader ? "Leader" : "Member"}</span>
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

            <div className="flex items-center gap-1">
              <Crown size={16} className="text-yellow-500" />
              <span className="text-xs">Leader</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* View Community Button (always visible) */}
            <Link href={`/communities/${community.id}`}>
              <Button
                variant="outline"
                className="w-full transition-all duration-200"
              >
                <Eye size={16} className="mr-2" />
                View Community
              </Button>
            </Link>

            {/* Join/Leave Button (only for authenticated users) */}
            {user && showJoinButton && (
              <Button
                onClick={handleJoinLeave}
                variant={isMember ? "secondary" : "primary"}
                className="w-full transition-all duration-200"
                loading={loading}
                disabled={loading}
              >
                {loading ? (
                  "Processing..."
                ) : isMember ? (
                  "Leave Community"
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Join Community
                  </>
                )}
              </Button>
            )}

            {/* Sign in prompt for non-authenticated users */}
            {!user && (
              <Button variant="ghost" className="w-full text-sm" disabled>
                Sign in to join communities
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityCard;
