"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function DeadlineManager({ currentDeadline, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newDeadline, setNewDeadline] = useState(
    currentDeadline
      ? new Date(currentDeadline).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // First check if we have admin access
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .single();

      if (profileError) {
        throw new Error("Failed to verify admin access");
      }

      if (profileData?.role !== "admin") {
        throw new Error("You don't have permission to update the deadline");
      }

      // Update the deadline
      const { error: updateError } = await supabase.from("settings").upsert(
        {
          key: "submission_deadline",
          value: new Date(newDeadline).toISOString(),
        },
        { onConflict: "key" }
      );

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update deadline in database");
      }

      onUpdate(new Date(newDeadline));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating deadline:", error);
      setError(error.message || "Failed to update deadline. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-gray-400">Submission Deadline</p>
          <p className="font-medium">
            {currentDeadline
              ? new Date(currentDeadline).toLocaleString()
              : "No deadline set"}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 bg-primary hover:bg-primary-dark rounded-md transition-colors text-sm"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Set New Deadline
        </label>
        <input
          type="datetime-local"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
          className="px-3 py-2 bg-black border border-gray-700 rounded-md text-white w-full focus:border-primary focus:ring-1 focus:ring-primary"
          required
        />
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
