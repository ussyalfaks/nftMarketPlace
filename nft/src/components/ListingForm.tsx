"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useMarketplace } from "../hooks/useMarketplace"
import { pinataClient } from "../lib/pinata-client"
import type { NFTMetadata } from "../lib/pinata-client"

interface ListingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const ListingForm: React.FC<ListingFormProps> = ({ onSuccess, onCancel }) => {
  const { publicKey } = useWallet()
  const { listNFT, isLoading } = useMarketplace()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    nftMint: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !imageFile) return

    setIsUploading(true)
    try {
      // Upload to IPFS if we have an image
      let metadataUri = ""
      if (imageFile) {
        const metadata: Omit<NFTMetadata, "image"> = {
          name: formData.name,
          description: formData.description,
          attributes: attributes.filter((attr) => attr.trait_type && attr.value),
        }
        const { metadataHash } = await pinataClient.uploadNFTWithMetadata(imageFile, metadata)
        metadataUri = pinataClient.getIPFSUrl(metadataHash)
      }

      // List NFT on marketplace
      await listNFT(formData.nftMint, Number.parseFloat(formData.price))
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to list NFT:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }])
  }

  const updateAttribute = (index: number, field: "trait_type" | "value", value: string) => {
    const updated = [...attributes]
    updated[index][field] = value
    setAttributes(updated)
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">List Your NFT</h2>
        <p className="text-gray-600">Create a new listing for your digital asset</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">NFT Mint Address</label>
          <input
            type="text"
            value={formData.nftMint}
            onChange={(e) => setFormData({ ...formData, nftMint: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            placeholder="Enter NFT mint address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="NFT Name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Price (SOL)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
            rows={4}
            placeholder="Describe your NFT"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Image</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">Attributes</label>
            <button
              type="button"
              onClick={addAttribute}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
            >
              + Add Attribute
            </button>
          </div>

          <div className="space-y-3">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input
                  type="text"
                  placeholder="Trait type"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading || isUploading || !publicKey}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isUploading ? "Uploading..." : isLoading ? "Listing..." : "List NFT"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ListingForm
