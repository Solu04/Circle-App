"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import Button from "@/components/Button";
import { Users, Target, Trophy, Play, Plus, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Circle
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join interest-based communities, participate in weekly challenges, and
          showcase your skills through livestreams and videos.
        </p>

        {user && profile && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
            <p className="text-blue-800">
              Welcome back,{" "}
              <span className="font-semibold">
                {profile.full_name || profile.username}
              </span>
              !
            </p>
            <p className="text-blue-600 text-sm">
              Reputation: {profile.reputation_points} points
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Join Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Connect with like-minded people in communities focused on your
              interests and passions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Target className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Weekly Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Participate in exciting weekly challenges designed to push your
              skills and creativity.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Play className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Share Content</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Submit livestreams or videos to showcase your challenge
              submissions and get feedback.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
            <CardTitle className="text-lg">Earn Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Build reputation, earn badges, and climb leaderboards as you
              complete challenges.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {user && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/communities" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Browse Communities
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Discover new communities to join
                  </p>
                  <div className="flex items-center justify-center text-blue-600 text-sm">
                    Explore <ArrowRight size={16} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/challenges" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Active Challenges
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    View and participate in challenges
                  </p>
                  <div className="flex items-center justify-center text-green-600 text-sm">
                    Participate <ArrowRight size={16} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/challenges/create" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Create Challenge
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start a new challenge for your community
                  </p>
                  <div className="flex items-center justify-center text-purple-600 text-sm">
                    Create <ArrowRight size={16} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center">
        {user ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Ready to get started?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/communities">
                <Button size="lg" className="px-8">
                  Browse Communities
                </Button>
              </Link>
              <Link href="/challenges">
                <Button variant="outline" size="lg" className="px-8">
                  View Active Challenges
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Ready to join the community?
            </h2>
            <p className="text-gray-600">
              Sign up today and start participating in challenges that match
              your interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link href="/communities">
                <Button variant="outline" size="lg" className="px-8">
                  Browse Communities
                </Button>
              </Link>
              <Link href="/challenges">
                <Button variant="outline" size="lg" className="px-8">
                  View Challenges
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Platform Stats */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Join the Growing Community
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
            <div className="text-gray-600">Active Communities</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">10+</div>
            <div className="text-gray-600">Weekly Challenges</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
            <div className="text-gray-600">Creative Possibilities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
