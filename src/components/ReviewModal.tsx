import React, { useState } from 'react';
import { X, Star, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, User } from '../types';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  isOpen: boolean;
  product: Product | null;
  user: User | null;
  onClose: () => void;
  onReviewSubmitted: (productId: string, rating: number, reviewsCount: number) => void;
  onOpenAuth: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  product,
  user,
  onClose,
  onReviewSubmitted,
  onOpenAuth
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user || (!user.phone && !user.email)) {
      setErrorMsg('Please Sign In with your phone number to leave a verified review.');
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Please write a short review feedback for this product.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/products/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment: comment.trim(),
          phone: user.phone || '9876543210',
          name: user.name || 'Verified Buyer'
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessMsg(data.message || '⭐ Verified Review submitted successfully!');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onReviewSubmitted(product.id, data.rating, data.reviewsCount);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Only verified purchasers can submit a review.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Review server connection failed. Please ensure you have purchased this product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-white space-y-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-xl bg-slate-950 border border-slate-800" />
            <div>
              <h3 className="font-extrabold text-sm text-white line-clamp-1">Write Verified Review</h3>
              <p className="text-[10px] text-amber-400 font-bold">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-400 text-xs font-semibold animate-shake shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-semibold animate-popIn shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* NOT LOGGED IN WARNING */}
        {!user && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
            <span>Sign in to verify your purchase history.</span>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[10px]"
            >
              Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* STAR RATING PICKER */}
          <div>
            <label className="block text-slate-300 font-bold mb-2">Select Your Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-125 transition transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400 shadow-sm'
                        : 'text-slate-700 fill-slate-900'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono font-black text-amber-400 text-base">{rating}.0 / 5.0</span>
            </div>
          </div>

          {/* REVIEW COMMENT INPUT */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Your Honest Product Review *</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the build quality, performance, and packaging?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Verifying Purchase & Submitting...' : 'Submit Verified Review ⭐'}</span>
          </button>

        </form>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Anti-Fake System • Order History Verification Required</span>
        </div>

      </div>
    </div>
  );
};
