"use client"

import type React from "react"
import type { ListingData } from "../types/nft"

interface PurchaseModalProps {
  nft: ListingData
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ nft, open, onConfirm, onCancel, isLoading }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase</h2>
            <p className="text-gray-600">You're about to purchase this NFT</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {nft.image && (
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-900">{nft.name}</div>
                {nft.description && <div className="text-gray-600 text-sm line-clamp-2">{nft.description}</div>}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Price</span>
                <span className="text-2xl font-bold text-gray-900">{nft.price} SOL</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Confirm Purchase"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseModal
