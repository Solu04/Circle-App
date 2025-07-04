"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function SupabaseTest() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addResult = (test, status, message) => {
    setResults((prev) => [
      ...prev,
      { test, status, message, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic Supabase connection
    try {
      addResult("Connection Test", "running", "Testing basic connection...");
      const { data, error } = await supabase
        .from("profiles")
        .select("count(*)")
        .limit(1);

      if (error) {
        addResult("Connection Test", "failed", `Error: ${error.message}`);
      } else {
        addResult("Connection Test", "passed", "Basic connection successful");
      }
    } catch (err) {
      addResult(
        "Connection Test",
        "failed",
        `Unexpected error: ${err.message}`
      );
    }

    // Test 2: Authentication status
    try {
      addResult("Auth Test", "running", "Checking authentication...");
      const { data: authData } = await supabase.auth.getUser();

      if (authData.user) {
        addResult(
          "Auth Test",
          "passed",
          `User authenticated: ${authData.user.email}`
        );
      } else {
        addResult("Auth Test", "warning", "No authenticated user");
      }
    } catch (err) {
      addResult("Auth Test", "failed", `Auth error: ${err.message}`);
    }

    // Test 3: Communities table access
    try {
      addResult(
        "Communities Access",
        "running",
        "Testing communities table access..."
      );
      const { data, error } = await supabase
        .from("communities")
        .select("id, name")
        .limit(1);

      if (error) {
        addResult("Communities Access", "failed", `Error: ${error.message}`);
      } else {
        addResult(
          "Communities Access",
          "passed",
          `Can read communities table. Found ${data.length} records`
        );
      }
    } catch (err) {
      addResult(
        "Communities Access",
        "failed",
        `Unexpected error: ${err.message}`
      );
    }

    // Test 4: Community creation (if user is authenticated)
    if (user) {
      try {
        addResult(
          "Community Creation",
          "running",
          "Testing community creation..."
        );

        const testCommunity = {
          name: `Test Community ${Date.now()}`,
          description: "This is a test community created for debugging",
          leader_id: user.id,
          is_active: true,
          member_count: 1,
        };

        const { data, error } = await supabase
          .from("communities")
          .insert(testCommunity)
          .select()
          .single();

        if (error) {
          addResult("Community Creation", "failed", `Error: ${error.message}`);
        } else {
          addResult(
            "Community Creation",
            "passed",
            `Successfully created test community: ${data.name}`
          );

          // Clean up - delete the test community
          await supabase.from("communities").delete().eq("id", data.id);
          addResult("Cleanup", "passed", "Test community deleted");
        }
      } catch (err) {
        addResult(
          "Community Creation",
          "failed",
          `Unexpected error: ${err.message}`
        );
      }
    } else {
      addResult(
        "Community Creation",
        "skipped",
        "User not authenticated - skipping creation test"
      );
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "running":
        return "text-blue-600 bg-blue-50";
      case "skipped":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">
        🔍 Supabase Connection Diagnostic
      </h2>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Running Tests..." : "Run Diagnostic Tests"}
        </button>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{result.test}</h3>
                <p className="text-sm">{result.message}</p>
              </div>
              <div className="text-xs opacity-75">{result.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          Click "Run Diagnostic Tests" to check your Supabase connection
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Environment Info:</h3>
        <div className="text-sm space-y-1">
          <div>
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}
          </div>
          <div>
            Anon Key:{" "}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing"}
          </div>
          <div>User: {user ? user.email : "Not authenticated"}</div>
        </div>
      </div>
    </div>
  );
}
