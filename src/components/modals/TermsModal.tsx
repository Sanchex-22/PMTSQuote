import { useEffect } from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export function TermsModal({ open, onClose }: TermsModalProps) {
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
      aria-labelledby="terms-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 id="terms-modal-title" className="text-base font-semibold text-gray-800">
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            By submitting a quotation request through{' '}
            <strong className="text-gray-800">Panama Maritime Training Services (PMTS)</strong>,
            you agree to the following terms and conditions.
          </p>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">1. Quotation Validity</h3>
            <p>
              All quotations issued by PMTS are valid for <strong>45 calendar days</strong> from
              the date of issue. After this period, prices and availability are subject to change
              without prior notice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">2. Course Enrollment</h3>
            <p>
              A quotation does not constitute a confirmed enrollment. Course registration is only
              confirmed upon receipt of full payment and submission of required documentation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">3. Pricing</h3>
            <p>
              Prices listed in the quotation include the applicable government fee (surcharge)
              based on the flag state selected. PMTS reserves the right to adjust prices due to
              regulatory changes or extraordinary circumstances.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">4. Cancellation & Refunds</h3>
            <p>
              Cancellations made at least 5 business days before the course start date may be
              eligible for a credit toward a future course. No refunds will be issued for
              no-shows or cancellations within 48 hours of the course.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">5. Accuracy of Information</h3>
            <p>
              The applicant is responsible for providing accurate personal and document
              information. PMTS is not liable for delays or rejections caused by incorrect data
              submitted during the quotation or enrollment process.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">6. Certificates</h3>
            <p>
              Training certificates are issued upon successful completion of the course and
              meeting all regulatory requirements. PMTS does not guarantee issuance if the
              candidate fails to meet maritime authority standards.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">7. Contact</h3>
            <p>
              For questions regarding these terms, please contact us at{' '}
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
