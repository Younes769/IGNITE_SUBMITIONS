"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import {
  ArrowTopRightOnSquareIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [presentationType, setPresentationType] = useState("file"); // "file" or "url"
  const [deadline, setDeadline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [bmcType, setBmcType] = useState("file");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  useEffect(() => {
    const fetchDeadline = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "submission_deadline")
        .single();

      if (!error && data) {
        const deadlineDate = new Date(data.value);
        setDeadline(deadlineDate);
        setIsExpired(new Date() > deadlineDate);
      }
      setIsLoading(false);
    };

    fetchDeadline();

    // Set up an interval to check deadline every minute
    const interval = setInterval(() => {
      if (deadline) {
        setIsExpired(new Date() > deadline);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [deadline]);

  const uploadFile = async (file, teamName, fileType) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${teamName}_${fileType}.${fileExt}`;
    const filePath = `${teamName}/${fileName}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      let bmcFilePath = null;
      let bmcUrl = null;

      if (bmcType === "file" && data.bmcFile?.[0]) {
        bmcFilePath = await uploadFile(data.bmcFile[0], data.teamName, "bmc");
      } else if (bmcType === "url" && data.bmcUrl) {
        bmcUrl = data.bmcUrl;
      }

      const technicalFilePath = await uploadFile(
        data.technicalFile[0],
        data.teamName,
        "technical"
      );

      let presentationFile = null;
      let presentationUrl = null;

      if (presentationType === "file" && data.presentationFile?.[0]) {
        presentationFile = await uploadFile(
          data.presentationFile[0],
          data.teamName,
          "presentation"
        );
      } else if (presentationType === "url" && data.presentationUrl) {
        presentationUrl = data.presentationUrl;
      }

      const supabase = createClient();
      const { error } = await supabase.from("submissions").insert({
        team_name: data.teamName,
        figma_url: data.figmaUrl,
        bmc_file: bmcFilePath,
        bmc_url: bmcUrl,
        technical_file: technicalFilePath,
        presentation_file: presentationFile,
        presentation_url: presentationUrl,
        drive_url: data.driveUrl || null,
      });

      if (error) throw error;

      toast.success("Project submitted successfully!");
      reset();
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <ClockIcon className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-red-500">
            Submissions are closed
          </h2>
          <p className="text-gray-400">
            The submission deadline ({deadline?.toLocaleString()}) has passed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden animate-fade-in">
      <form
        onSubmit={handleSubmit(() => setShowConfirmModal(true))}
        className="divide-y divide-white/5"
      >
        <div className="form-section">
          <h2 className="form-section-title">
            <span className="form-section-number">1</span>
            Team Information
          </h2>
          <div>
            <label className="input-label">Team Name</label>
            <input
              type="text"
              className="form-input"
              {...register("teamName", {
                required: "Team name is required",
              })}
              placeholder="Enter your team name"
            />
            {errors.teamName && (
              <p className="error-message">{errors.teamName.message}</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">
            <span className="form-section-number">2</span>
            Project Links
          </h2>
          <div>
            <label className="input-label flex items-center">
              DEMO File URL
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <input
              type="url"
              className="form-input"
              {...register("figmaUrl", {
                required: "Figma URL is required",
                pattern: {
                  value: /^https:\/\/([\w\.-]+\.)?figma.com\/.*/,
                  message: "Please enter a valid Figma URL",
                },
              })}
              placeholder="DEMO File URL"
            />
            {errors.figmaUrl && (
              <p className="error-message">{errors.figmaUrl.message}</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">
            <span className="form-section-number">3</span>
            Project Files
          </h2>
          <div className="space-y-6">
            <div>
              <label className="input-label flex items-center">
                BMC File
                <DocumentArrowUpIcon className="w-4 h-4 ml-1 text-gray-400" />
              </label>

              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setBmcType("file")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    bmcType === "file"
                      ? "bg-primary text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setBmcType("url")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    bmcType === "url"
                      ? "bg-primary text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add URL
                </button>
              </div>

              {bmcType === "file" ? (
                <div>
                  <input
                    type="file"
                    className="form-file"
                    accept=".pdf,.doc,.docx"
                    {...register("bmcFile", {
                      required:
                        bmcType === "file" ? "BMC file is required" : false,
                    })}
                  />
                  {errors.bmcFile && (
                    <p className="error-message">{errors.bmcFile.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Enter your BMC document link"
                    {...register("bmcUrl", {
                      required:
                        bmcType === "url" ? "BMC URL is required" : false,
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Please enter a valid URL starting with http:// or https://",
                      },
                    })}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Share your BMC document link (Google Docs, PDF, or any other
                    platform)
                  </p>
                  {errors.bmcUrl && (
                    <p className="error-message">{errors.bmcUrl.message}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="input-label flex items-center">
                Technical Documentation
                <DocumentArrowUpIcon className="w-4 h-4 ml-1 text-gray-400" />
              </label>
              <input
                type="file"
                className="form-file"
                accept=".pdf"
                {...register("technicalFile", {
                  required: "Technical documentation is required",
                })}
              />
              <p className="text-sm text-gray-400 mt-1">
                Upload your technical documentation in PDF format
              </p>
              {errors.technicalFile && (
                <p className="error-message">{errors.technicalFile.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="input-label">Presentation</label>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setPresentationType("file")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    presentationType === "file"
                      ? "bg-primary text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPresentationType("url")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    presentationType === "url"
                      ? "bg-primary text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add URL
                </button>
              </div>

              {presentationType === "file" ? (
                <div>
                  <input
                    type="file"
                    className="form-file"
                    accept=".pdf,.ppt,.pptx"
                    {...register("presentationFile", {
                      required: "Presentation file is required",
                    })}
                  />
                  {errors.presentationFile && (
                    <p className="error-message">
                      {errors.presentationFile.message}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Enter your presentation link"
                    {...register("presentationUrl", {
                      required: "Presentation URL is required",
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Please enter a valid URL starting with http:// or https://",
                      },
                    })}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Share your presentation link (Google Slides, Canva, or any
                    other platform)
                  </p>
                  {errors.presentationUrl && (
                    <p className="error-message">
                      {errors.presentationUrl.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">
            <span className="form-section-number">4</span>
            Additional Resources
          </h2>
          <div>
            <label className="input-label flex items-center">
              Google Drive Link (Optional)
              <LinkIcon className="w-4 h-4 ml-1 text-gray-400" />
            </label>
            <input
              type="url"
              className="form-input"
              {...register("driveUrl", {
                pattern: {
                  value:
                    /^https:\/\/(drive\.google\.com|docs\.google\.com)\/.*/,
                  message: "Please enter a valid Google Drive URL",
                },
              })}
              placeholder="https://drive.google.com/..."
            />
            <p className="text-sm text-gray-400 mt-1">
              Share any additional files or resources via Google Drive
            </p>
            {errors.driveUrl && (
              <p className="error-message">{errors.driveUrl.message}</p>
            )}
          </div>
        </div>

        <div className="p-6">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Submitting..." : "Submit Project"}
          </button>
        </div>
      </form>

      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-darker rounded-lg p-6 max-w-sm w-full">
            <Dialog.Title className="text-xl font-bold text-gradient mb-4">
              Confirm Submission
            </Dialog.Title>
            <p className="text-gray-300 mb-6">
              Are you sure you want to submit your project? This action cannot
              be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
