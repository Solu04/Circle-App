// Debug Membership Detection Component
// Add this temporarily to your challenge page to debug membership issues

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { isUserMemberOfCommunity, getUserCommunities } from "@/lib/database";

const MembershipDebugger = ({ challenge }) => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    if (!user || !challenge?.community_id) return;

    setLoading(true);
    try {
      // Check membership using the same function as voting
      const membershipResult = await isUserMemberOfCommunity(
        user.id,
        challenge.community_id
      );

      // Get all user communities for comparison
      const userCommunities = await getUserCommunities(user.id);

      // Check if community is in user's communities list
      const isInUserCommunities = userCommunities.some(
        (membership) => membership.community_id === challenge.community_id
      );

      setDebugInfo({
        userId: user.id,
        communityId: challenge.community_id,
        membershipFunctionResult: membershipResult,
        userCommunitiesCount: userCommunities.length,
        isInUserCommunities,
        userCommunities: userCommunities.map((m) => ({
          id: m.community_id,
          name: m.community?.name || "Unknown",
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setDebugInfo({
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && challenge?.community_id) {
      runDebugCheck();
    }
  }, [user, challenge?.community_id]);

  if (!user || !challenge) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">
        🐛 Membership Debug Info
      </h3>

      <button
        onClick={runDebugCheck}
        disabled={loading}
        className="mb-3 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm"
      >
        {loading ? "Checking..." : "Refresh Check"}
      </button>

      <pre className="text-xs bg-white p-2 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      {debugInfo.membershipFunctionResult ? (
        <div className="mt-2 text-green-700 font-medium">
          ✅ User IS a member - voting should work
        </div>
      ) : debugInfo.membershipFunctionResult === false ? (
        <div className="mt-2 text-red-700 font-medium">
          ❌ User is NOT a member - voting will be blocked
        </div>
      ) : (
        <div className="mt-2 text-gray-700">⏳ Membership status unknown</div>
      )}
    </div>
  );
};

// Add this to your challenge page JSX:
// <MembershipDebugger challenge={challenge} />

export default MembershipDebugger;
