import { useEffect } from "react";
import SubmissionForm from "./SubmissionForm";

export default function RegistrationModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-h-[90vh] overflow-y-auto max-w-lg sm:max-w-xl md:max-w-2xl bg-black/90 rounded-xl border border-primary/20 p-4 sm:p-6 shadow-2xl shadow-primary/10 animate-fade-in scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Project Submission
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Fill in your project details below
          </p>
        </div>

        {/* Form */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-1">
          <SubmissionForm onSubmitSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
