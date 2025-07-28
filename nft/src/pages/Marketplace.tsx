"use client"

import type React from "react"
import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "react-query"
import NFTCard from "../components/NFTCard"
import type { ListingData } from "../types/nft"
import { initializeProgram } from "../lib/anchor-client"

const Marketplace: React.FC = () => {
  const { connection } = useConnection()
  const { wallet, publicKey } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "newest">("newest")

  const fetchListings = async (): Promise<ListingData[]> => {
    if (!wallet) return []
    try {
      const { program } = initializeProgram(wallet.adapter, connection)
      // Fetch all listing accounts
      const listings = await (program.account as any)["listing"].all()

      // Transform to ListingData format
      const listingData: ListingData[] = await Promise.all(
        listings.map(async (listing: any) => {
          try {
            // Fetch metadata from IPFS or on-chain
            const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${listing.account.metadata}`)
            const metadata = await metadataResponse.json()

            return {
              mint: listing.account.nftMint.toString(),
              name: metadata.name || "Unnamed NFT",
              symbol: metadata.symbol || "",
              description: metadata.description || "",
              image: metadata.image || "",
              attributes: metadata.attributes || [],
              seller: listing.account.maker.toString(),
              listingAccount: listing.publicKey.toString(),
              price: listing.account.price.toNumber(),
              listed: true,
              timestamp: Date.now(), // You might want to get this from events
            }
          } catch (error) {
            console.error("Error fetching metadata for listing:", error)
            return {
              mint: listing.account.nftMint.toString(),
              name: "Unknown NFT",
              symbol: "",
              seller: listing.account.maker.toString(),
              listingAccount: listing.publicKey.toString(),
              price: listing.account.price.toNumber(),
              listed: true,
              timestamp: Date.now(),
            }
          }
        }),
      )

      return listingData
    } catch (error) {
      console.error("Error fetching listings:", error)
      return []
    }
  }

  const {
    data: listings = [],
    isLoading,
    refetch,
  } = useQuery("marketplace-listings", fetchListings, {
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!wallet,
  })

  const filteredAndSortedListings = listings
    .filter(
      (listing) =>
        listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price ?? 0) - (b.price ?? 0)
        case "price-high":
          return (b.price ?? 0) - (a.price ?? 0)
        case "newest":
          return b.timestamp - a.timestamp
        default:
          return 0
      }
    })

  const handlePurchase = () => {
    refetch()
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 leading-relaxed">
            Please connect your wallet to explore and purchase NFTs from our marketplace
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              NFT Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover, collect, and trade unique digital assets on Solana
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search NFTs by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              <div className="lg:w-64">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">{filteredAndSortedListings.length} NFTs available</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live marketplace</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No NFTs Found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms or browse all available NFTs"
                : "No NFTs are currently listed for sale. Check back soon for new listings!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedListings.map((listing) => (
              <NFTCard
                key={listing.listingAccount}
                nft={listing}
                onPurchase={handlePurchase}
                isOwner={listing.seller === publicKey?.toString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace
