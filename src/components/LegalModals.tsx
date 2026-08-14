import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Info, Mail, CheckCircle } from 'lucide-react';

interface LegalModalProps {
  modalType: 'about' | 'privacy' | 'terms' | 'returns' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  const renderContent = () => {
    switch (modalType) {
      case 'privacy':
        return (
          <div className="space-y-5 text-xs text-slate-300 leading-relaxed text-left">
            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                1. Scope & Data Collection
              </h4>
              <p>
                Shadow Arrow Prime Marketplace ("We", "Our", "Us") respects your personal data and privacy rights. To provide a seamless e-commerce experience across India, we collect necessary personal information when you register, browse, or place an order.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li><strong>Personal Identity Data:</strong> Full Name, Mobile Phone Number, Email Address.</li>
                <li><strong>Logistics Data:</strong> Street Address, City, State, 6-digit Pincode.</li>
                <li><strong>Technical Identifiers:</strong> IP Address, Browser Type, Device Operating System, and Session Cookies.</li>
                <li><strong>Payment Metadata:</strong> Transaction IDs and payment mode confirmation (we do NOT store raw credit card CVV or net-banking passwords).</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                2. Purpose & Utilization of Information
              </h4>
              <p>
                Your data is gathered strictly for legitimate business execution under the Information Technology Act, 2000 and Digital Personal Data Protection (DPDP) Guidelines:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li>Dispatching orders and generating GST-compliant invoices.</li>
                <li>Sending real-time WhatsApp & SMS order notifications and 3 - 4 Days Express Delivery tracking updates.</li>
                <li>Providing 24/7 customer support via Shadow AI Assistant and human agents.</li>
                <li>Preventing fraudulent orders, unauthorized access, and payment abuse.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                3. Data Protection & Security Protocols
              </h4>
              <p>
                We implement robust technical safeguards including end-to-end 256-bit SSL/TLS encryption for all data transmitted through our web application. Databases are maintained on secure cloud servers protected by firewall rules and restricted administrative access.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                4. Third-Party Sharing Policies
              </h4>
              <p>
                <strong>We NEVER sell, trade, or rent customer personal data to third-party marketing brokers.</strong> Information is shared solely with essential operational partners:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li><strong>Logistics Courier Agencies:</strong> Verified express couriers (e.g. BlueDart, Delhivery, Shadow Express) solely for parcel delivery.</li>
                <li><strong>Payment Gateways:</strong> PCI-DSS compliant payment processing platforms (Razorpay) for verifying transactions.</li>
                <li><strong>Legal Compliance:</strong> Government or law enforcement bodies only when mandated by official statutory court orders.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                5. Cookies & Preference Tracking
              </h4>
              <p>
                We use session cookies to remember your active shopping cart items, saved pincode, and theme preferences. You may disable cookies in your browser settings, though certain dynamic cart features may require session cookies to function properly.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="font-extrabold text-sm text-amber-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> 6. Grievance Redressal & Support Contact
              </h4>
              <p className="text-[11px] text-slate-400">
                For data deletion requests, privacy queries, or grievance redressal, please contact our designated Nodal Privacy Officer:
              </p>
              <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline flex items-center gap-1 text-xs">
                  <span>Open Official Full Privacy Policy Page ↗</span>
                </a>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-5 text-xs text-slate-300 leading-relaxed text-left">
            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                1. Acceptance of Terms & Account Duty
              </h4>
              <p>
                By accessing or registering on "Shadow Arrow Prime Marketplace" (shadowarrow.in), you enter into a legally binding agreement to abide by these Terms of Usage. Users are responsible for providing valid mobile phone numbers and accurate full delivery address details. Account credentials must remain confidential.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                2. Pricing, Taxes & GST Inclusion
              </h4>
              <p>
                All product prices listed on the platform are in Indian Rupees (INR - ₹) and include applicable Goods and Services Tax (GST). Prices are subject to dynamic real-time promotional adjustments during Mega Festival Sale periods. We reserve the right to correct typographical pricing errors before order fulfillment.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                3. Order Acceptance, Verification & Cancellation
              </h4>
              <p>
                Receipt of an electronic order confirmation does not signify our final order acceptance. We reserve the right to cancel orders in cases of suspicious bulk reseller abuse, fraudulent card activity, or stock unavailability.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li><strong>Customer Cancellation:</strong> Orders may be cancelled penalty-free prior to courier dispatch by contacting support.</li>
                <li><strong>Seller Cancellation:</strong> If an order is cancelled by us, a 100% refund is processed immediately to the original payment mode.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                4. Intellectual Property Rights
              </h4>
              <p>
                All content published on Shadow Arrow Prime Marketplace—including brand logos ("SA"), software code, graphics, product photography, text copy, and user interface designs—is the exclusive intellectual property of Shadow Arrow and protected under Indian Copyright and Trademark laws. Unauthorized reproduction is strictly prohibited.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                5. Limitation of Liability
              </h4>
              <p>
                Shadow Arrow acts as a direct fulfillment platform for high-performance gear. We shall not be held liable for indirect, incidental, or logistical delays caused by severe weather, regional bandhs, or courier transit disruptions beyond our reasonable control.
              </p>
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-5 text-xs text-slate-300 leading-relaxed text-left">
            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                1. 7-Day Replacement & Return Window
              </h4>
              <p>
                We offer a customer-first <strong>7-Day Replacement Policy</strong> for all physical items purchased on Shadow Arrow Prime Marketplace. The 7-day window begins on the exact date and time of verified courier delivery.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                2. Mandatory Eligibility & Proof Criteria
              </h4>
              <p>
                To qualify for a hassle-free doorstep replacement or return, the returned product must fulfill the following mandatory criteria:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li><strong>Unused Condition:</strong> Product must be in original condition with all brand tags, manuals, and accessories intact.</li>
                <li><strong>Original Packaging:</strong> Returned inside original Shadow Arrow retail box.</li>
                <li><strong>Video/Photo Proof:</strong> For damaged or defective items, a clear unboxing video or photo showing the issue must be provided when raising the ticket.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                3. Refund & Cash on Delivery (COD) Processing
              </h4>
              <p>
                Once returned items pass physical inspection at our central warehouse:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li><strong>Prepaid / Razorpay Orders:</strong> Refunds are credited directly back to the original source bank/card/UPI account within 3 to 5 business days.</li>
                <li><strong>COD Orders:</strong> Customer must provide a valid UPI ID or Bank Account details for direct electronic refund transfer upon item verification.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                4. Excluded Non-Returnable Items
              </h4>
              <p>
                The following categories are non-returnable due to hygiene or clearance terms:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li>Products marked specifically as "Clearance Final Sale".</li>
                <li>Hygienic innerwear or unsealed earbud tips.</li>
                <li>Items damaged due to electrical surge, liquid spill, or physical tampering after delivery.</li>
              </ul>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-5 text-xs text-slate-300 leading-relaxed text-left">
            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                1. Corporate Mission & Multi-Channel Marketplace Presence
              </h4>
              <p>
                <strong>Shadow Arrow Prime Marketplace</strong> is India's premier brand for esports mechanical gear, ultra-wide 2K curved displays, active noise-cancelling audio, and cyberpunk techwear apparel. In addition to our direct standalone Prime Direct Portal (shadowarrow.in), <strong>Shadow Arrow is an official verified seller on Flipkart and Amazon India</strong>.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                2. Quality Inspection & Genuine Sourcing
              </h4>
              <p>
                Every single item listed on Shadow Arrow undergoes a 5-point quality audit prior to entering our warehouse. We source products directly from accredited component manufacturers, ensuring 100% authenticity and full warranty protection.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white border-b border-slate-800 pb-1 mb-2">
                3. Express Prime Fulfillment Across India
              </h4>
              <p>
                Equipped with automated logistics hubs in Delhi NCR, Mumbai, Bangalore, and Hyderabad, we ensure 3 - 4 Days Express Delivery to over 19,000 pincodes across India.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> 100% Shadow Verified Guarantee
              </h4>
              <p className="text-[11px] text-slate-400">
                Have questions or corporate bulk procurement requests? Contact our official operations desk:
              </p>
              <div className="text-white font-mono font-bold text-xs space-y-1">
                <div>Email: <a href="mailto:support.shadowarrow@gmail.com" className="text-amber-400 underline">support.shadowarrow@gmail.com</a></div>
                <div>Support: Active 24/7 via Shadow AI Assistant</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (modalType) {
      case 'privacy': return 'Privacy Policy & Data Protection';
      case 'terms': return 'Terms & Conditions of Service';
      case 'returns': return 'Returns, Replacement & Refund Policy';
      case 'about': return 'About Shadow Arrow Prime Marketplace';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            {getTitle()}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {renderContent()}
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center flex-shrink-0 text-xs">
          <span className="text-slate-500">Last updated: August 2026 • Governed by Indian Law</span>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2 rounded-xl transition"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
