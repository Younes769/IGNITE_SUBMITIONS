"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import {
  ArrowTopRightOnSquareIcon,
  DocumentArrowUpIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export default function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [presentationType, setPresentationType] = useState("file"); // "file" or "url"

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

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

      const bmcFilePath = await uploadFile(
        data.bmcFile[0],
        data.teamName,
        "bmc"
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
        presentation_file: presentationFile,
        presentation_url: presentationUrl,
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
              Figma File URL
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
              placeholder="https://figma.com/file/..."
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
              <input
                type="file"
                className="form-file"
                accept=".pdf,.doc,.docx"
                {...register("bmcFile", {
                  required: "BMC file is required",
                })}
              />
              {errors.bmcFile && (
                <p className="error-message">{errors.bmcFile.message}</p>
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
                    placeholder="https://www.canva.com/design/..."
                    {...register("presentationUrl", {
                      required: "Presentation URL is required",
                      pattern: {
                        value: /^https:\/\/([\w\.-]+\.)?canva\.com\/.*/,
                        message: "Please enter a valid Canva URL",
                      },
                    })}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Please share your Canva presentation with view access
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
