import { useEffect } from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 id="privacy-modal-title" className="text-base font-semibold text-gray-800">
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            At <strong className="text-gray-800">Panama Maritime Training Services (PMTS)</strong>, the
            information and documents provided by users are used exclusively for internal purposes
            and for the processing of services or course-related procedures.
          </p>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Data Collection</h3>
            <p>
              We collect personal information such as your name, email address, phone number,
              nationality, and identification document solely to process your training quotation
              and enrollment requests.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Data Use</h3>
            <p>
              All data is handled confidentially and recorded only to meet the requirements of
              enrollment and certification processes. Your information may be used to send you
              your quotation, follow up on your request, and issue training certificates.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Data Sharing</h3>
            <p>
              We do not share your personal information with any third parties outside the
              organization, except where required by maritime regulatory authorities for
              certification purposes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Data Retention</h3>
            <p>
              Your data is retained for as long as necessary to fulfill the purposes described
              above, or as required by applicable maritime and labor regulations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Contact</h3>
            <p>
              For any questions regarding your personal data, please contact us at{' '}
              <a
                href="mailto:info@panamamaritimetraining.com"
                className="text-orange-500 hover:text-orange-700 underline"
              >
                info@panamamaritimetraining.com
              </a>
              .
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
