"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createCommunity } from "@/lib/database";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateCommunity() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Community name is required");
      return false;
    }
    if (formData.name.trim().length < 3) {
      setError("Community name must be at least 3 characters long");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Community description is required");
      return false;
    }
    if (formData.description.trim().length < 10) {
      setError("Community description must be at least 10 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError("You must be logged in to create a community");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Creating community with data:", {
        ...formData,
        leader_id: user.id,
      });

      // Prepare community data
      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim() || null,
        leader_id: user.id,
        is_active: true,
        // member_count: 1, // Creator automatically becomes first member
      };

      // Add this line right before: const result = await createCommunity(communityData);
      console.log(
        "Form data being sent:",
        JSON.stringify(communityData, null, 2)
      );

      const result = await createCommunity(communityData);

      console.log("Community creation result:", result);

      if (result.error) {
        console.error("Community creation error:", result.error);
        setError(result.error.message || "Failed to create community");
        return;
      }

      if (result.data && result.data.length > 0) {
        setSuccess("Community created successfully!");
        console.log("Community created:", result.data[0]);

        // Redirect to the new community page after a short delay
        setTimeout(() => {
          router.push(`/communities/${result.data[0].id}`);
        }, 1500);
      } else {
        setError("Community was created but no data was returned");
      }
    } catch (err) {
      console.error("Unexpected error creating community:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Community
              </h1>
              <p className="text-gray-600">
                Start your own community and bring people together around shared
                interests
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Community Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter community name (e.g., Gaming Enthusiasts)"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what your community is about, what kind of content you'll share, and what members can expect..."
                  required
                  disabled={loading}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="image_url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Community Image URL (Optional)
                </label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a URL to an image that represents your community
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Community"}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You'll automatically become the community leader</li>
                <li>• You can create weekly challenges for your community</li>
                <li>• Members can join and participate in challenges</li>
                <li>• You can moderate submissions and manage the community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
