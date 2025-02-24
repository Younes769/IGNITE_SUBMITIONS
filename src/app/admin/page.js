"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import DeadlineManager from "@/components/DeadlineManager";
import { Dialog } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("Dashboard session check:", { session, error });

        if (error || !session?.user) {
          router.replace("/admin/login");
          return;
        }

        setSession(session);
        await fetchData();
      } catch (error) {
        console.error("Session error:", error);
        router.replace("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchData = async () => {
      const supabase = createClient();
      try {
        // Fetch submissions
        const { data: submissionsData, error: submissionsError } =
          await supabase
            .from("submissions")
            .select("*")
            .order("created_at", { ascending: false });

        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);

        // Fetch deadline
        const { data: deadlineData, error: deadlineError } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "submission_deadline")
          .single();

        if (deadlineError && deadlineError.code !== "PGRST116")
          throw deadlineError;
        setDeadline(deadlineData?.value ? new Date(deadlineData.value) : null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    checkSession();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/admin/login");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.replace("/admin/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDownload = async (filePath) => {
    const supabase = createClient();
    try {
      // First get the file data
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("submissions")
        .download(filePath);

      if (downloadError) throw downloadError;

      // Create a blob from the file data
      const blob = new Blob([fileData], {
        type: getContentType(filePath),
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = filePath.split("/").pop(); // Set the filename

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading file. Please try again.");
    }
  };

  // Helper function to determine content type
  const getContentType = (filePath) => {
    const extension = filePath.split(".").pop().toLowerCase();
    const contentTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
    return contentTypes[extension] || "application/octet-stream";
  };

  const handleDeadlineUpdate = (newDeadline) => {
    setDeadline(newDeadline);
  };

  const handleDeleteClick = (submission) => {
    setSubmissionToDelete(submission);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!submissionToDelete) return;

    setIsDeleting(true);
    const supabase = createClient();

    try {
      console.log("Starting deletion for submission:", submissionToDelete.id);

      // Delete files from storage if they exist
      if (submissionToDelete.bmc_file) {
        console.log("Deleting BMC file:", submissionToDelete.bmc_file);
        const { error: bmcError } = await supabase.storage
          .from("submissions")
          .remove([submissionToDelete.bmc_file]);

        if (bmcError) {
          console.error("Error deleting BMC file:", bmcError);
          throw bmcError;
        }
      }

      if (submissionToDelete.technical_file) {
        console.log(
          "Deleting technical file:",
          submissionToDelete.technical_file
        );
        const { error: technicalError } = await supabase.storage
          .from("submissions")
          .remove([submissionToDelete.technical_file]);

        if (technicalError) {
          console.error("Error deleting technical file:", technicalError);
          throw technicalError;
        }
      }

      if (submissionToDelete.presentation_file) {
        console.log(
          "Deleting presentation file:",
          submissionToDelete.presentation_file
        );
        const { error: presentationError } = await supabase.storage
          .from("submissions")
          .remove([submissionToDelete.presentation_file]);

        if (presentationError) {
          console.error("Error deleting presentation file:", presentationError);
          throw presentationError;
        }
      }

      // Delete submission from database
      console.log("Deleting submission from database:", submissionToDelete.id);
      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submissionToDelete.id);

      if (deleteError) {
        console.error("Error deleting submission:", deleteError);
        throw deleteError;
      }

      // Fetch updated submissions list
      const { data: updatedSubmissions, error: fetchError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching updated submissions:", fetchError);
        throw fetchError;
      }

      // Update local state with fresh data
      setSubmissions(updatedSubmissions);
      toast.success("Submission deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.message || "Error deleting submission. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setSubmissionToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Logged in as: {session?.user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <DeadlineManager
              currentDeadline={deadline}
              onUpdate={handleDeadlineUpdate}
            />
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">Project Submissions</h2>
            <p className="text-gray-400 mt-1">
              Total submissions: {submissions.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/20">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Team Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Figma URL
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    BMC File
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Technical Doc
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Additional Files
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Presentation
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">
                          {submission.team_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={submission.figma_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-light inline-flex items-center"
                        >
                          View Figma
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {submission.bmc_file ? (
                          <button
                            onClick={() => handleDownload(submission.bmc_file)}
                            className="text-primary hover:text-primary-light inline-flex items-center"
                          >
                            Download BMC
                            <DocumentArrowDownIcon className="w-4 h-4 ml-1" />
                          </button>
                        ) : submission.bmc_url ? (
                          <a
                            href={submission.bmc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light inline-flex items-center"
                          >
                            View BMC
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-500">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleDownload(submission.technical_file)
                          }
                          className="text-primary hover:text-primary-light inline-flex items-center"
                        >
                          Download PDF
                          <DocumentArrowDownIcon className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {submission.drive_url ? (
                          <a
                            href={submission.drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light inline-flex items-center"
                          >
                            View Drive
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-500">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {submission.presentation_file ? (
                          <button
                            onClick={() =>
                              handleDownload(submission.presentation_file)
                            }
                            className="text-primary hover:text-primary-light inline-flex items-center"
                          >
                            Download Presentation
                            <DocumentArrowDownIcon className="w-4 h-4 ml-1" />
                          </button>
                        ) : submission.presentation_url ? (
                          <a
                            href={submission.presentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light inline-flex items-center"
                          >
                            View Presentation
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-500">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {format(new Date(submission.created_at), "PPP 'at' pp")}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteClick(submission)}
                          className="text-red-500 hover:text-red-400 inline-flex items-center"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-darker rounded-lg p-6 max-w-sm w-full">
            <Dialog.Title className="text-xl font-bold text-red-500 mb-4">
              Delete Submission
            </Dialog.Title>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the submission from{" "}
              <span className="font-semibold text-white">
                {submissionToDelete?.team_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                disabled={isDeleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
