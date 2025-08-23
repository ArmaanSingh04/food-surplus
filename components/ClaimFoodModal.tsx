"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { claimFood } from "@/app/actions";

interface ClaimFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  foodName: string;
  maxQuantity: number;
  quantityType: string;
  leftoverQuantity: number;
  onClaimSuccess?: () => void;
}

export default function ClaimFoodModal({
  isOpen,
  onClose,
  postId,
  foodName,
  maxQuantity,
  quantityType,
  leftoverQuantity,
  onClaimSuccess
}: ClaimFoodModalProps) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setError(null);
      setIsSuccess(false);
      setClaimResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError("You must be logged in to claim food");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Parse quantity only on submit
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setIsSubmitting(false);
      setError("Please enter a valid quantity");
      return;
    }

    try {
      const result = await claimFood(postId, session.user.id, qty);

      if (result.success) {
        //console.log(`Successfully claimed ${result.claimed_quantity || quantity} ${quantityType} of ${foodName} from post ${postId}`);
        setClaimResult(result);
        setIsSuccess(true);
        setError(null);

        // Show appropriate message based on claim status
        if (result.status === 'accepted') {
          // Close modal after 2 seconds for accepted claims
          setTimeout(() => {
            onClose();
            setQuantity(""); // Reset quantity
            setIsSuccess(false);
            setClaimResult(null);
            onClaimSuccess?.(); // Refresh posts
            // Reload the page to ensure dashboard shows updated status
            window.location.reload();
          }, 2000);
        } else {
          // For pending claims, close modal after 3 seconds to show status
          setTimeout(() => {
            onClose();
            setQuantity(""); // Reset quantity
            setIsSuccess(false);
            setClaimResult(null);
            onClaimSuccess?.(); // Refresh posts
            // Reload the page to ensure dashboard shows updated status
            window.location.reload();
          }, 3000);
        }
      } else {
        setError(result.error || "Failed to claim food");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f5dc] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-3xl max-w-md w-full p-6 relative">
        <button
          onClick={() => {
            onClose();
            window.location.reload();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Claim Food</h2>
          <p className="text-gray-600 mt-2">How much would you like to claim?</p>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6 border border-primary-100">
          <h3 className="font-semibold text-gray-900 text-lg">{foodName}</h3>
          <p className="text-gray-600 text-sm">
            Available: {leftoverQuantity} {quantityType}
          </p>
          {leftoverQuantity < maxQuantity && (
            <p className="text-xs text-gray-500 mt-1">
              Originally: {maxQuantity} {quantityType}
            </p>
          )}
        </div>

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-600 text-sm font-medium">
                {claimResult?.status === 'accepted'
                  ? `Successfully claimed ${claimResult.claimed_quantity || quantity} ${quantityType} of ${foodName}!`
                  : `Claim submitted for ${claimResult.claimed_quantity || quantity} ${quantityType} of ${foodName}. Status: Pending`
                }
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Claim
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="input-field w-full text-center text-lg font-semibold"
                  placeholder="Enter quantity"
                  key={`quantity-${postId}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {quantityType}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                disabled={isSubmitting}
                className="flex-1 btn-outline py-3 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary py-3 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Claiming...</span>
                  </div>
                ) : (
                  "Claim Food"
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By claiming this food, you agree to pick it up within the specified time.
          </p>
        </div>
      </div>
    </div>
  );
}
