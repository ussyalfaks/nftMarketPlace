"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import type { ListingData } from "../types/nft"
import { useMarketplace } from "../hooks/useMarketplace"
import { formatSOL, shortenAddress } from "../utils/helpers"

interface NFTCardProps {
  nft: ListingData
  onPurchase?: () => void
  onDelist?: () => void
  isOwner?: boolean
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onPurchase, onDelist, isOwner = false }) => {
  const { publicKey } = useWallet()
  const { purchaseNFT, delistNFT, isLoading } = useMarketplace()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    if (!publicKey || !onPurchase) return
    setIsProcessing(true)
    try {
      await purchaseNFT(nft.mint, nft.seller)
      onPurchase()
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelist = async () => {
    if (!publicKey || !onDelist) return
    setIsProcessing(true)
    try {
      await delistNFT(nft.mint)
      onDelist()
    } catch (error) {
      console.error("Delist failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {nft.image ? (
          <img
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
            {formatSOL(nft.price || 0)} SOL
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{nft.name || "Unnamed NFT"}</h3>
          {nft.description && <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{nft.description}</p>}
        </div>

        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{nft.seller.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Owner</div>
              <div className="text-sm font-semibold text-gray-700">{shortenAddress(nft.seller)}</div>
            </div>
          </div>
        </div>

        {nft.attributes && nft.attributes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {nft.attributes.slice(0, 3).map((attr, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
              {nft.attributes.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  +{nft.attributes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          {isOwner ? (
            <button
              onClick={handleDelist}
              disabled={isProcessing || isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? "Delisting..." : "Delist NFT"}
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isProcessing || isLoading || !publicKey}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isProcessing ? "Purchasing..." : "Buy Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NFTCard
