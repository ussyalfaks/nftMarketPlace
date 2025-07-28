"use client"

import type React from "react"
import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "react-query"
import NFTCard from "../components/NFTCard"
import ListingForm from "../components/ListingForm"
import type { ListingData, NFT } from "../types/nft"
import { initializeProgram } from "../lib/anchor-client"

const MyNFTs: React.FC = () => {
  const { connection } = useConnection()
  const { wallet, publicKey } = useWallet()
  const [showListingForm, setShowListingForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"owned" | "listed">("owned")

  const fetchMyNFTs = async (): Promise<{ owned: NFT[]; listed: ListingData[] }> => {
    if (!wallet || !publicKey) return { owned: [], listed: [] }
    try {
      const { program } = initializeProgram(wallet.adapter, connection)

      // Fetch user's listed NFTs
      const myListings = await (program.account as any)["listing"].all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: publicKey.toBase58(),
          },
        },
      ])

      const listed: ListingData[] = await Promise.all(
        myListings.map(async (listing: any) => {
          try {
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
              timestamp: Date.now(),
            }
          } catch (error) {
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

      // For owned NFTs, you would typically fetch from user's token accounts
      // This is a simplified version - in practice, you'd need to:
      // 1. Get all token accounts for the user
      // 2. Filter for NFTs (amount = 1, decimals = 0)
      // 3. Fetch metadata for each NFT
      const owned: NFT[] = [] // Placeholder - implement based on your needs

      return { owned, listed }
    } catch (error) {
      console.error("Error fetching user NFTs:", error)
      return { owned: [], listed: [] }
    }
  }

  const {
    data: myNFTs = { owned: [], listed: [] },
    isLoading,
    refetch,
  } = useQuery("my-nfts", fetchMyNFTs, {
    enabled: !!wallet && !!publicKey,
  })

  const handleListingSuccess = () => {
    setShowListingForm(false)
    refetch()
  }

  const handleDelist = () => {
    refetch()
  }

  if (!wallet || !publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center w-full">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 leading-relaxed">
            Please connect your wallet to view and manage your NFT collection
          </p>
        </div>
      </div>
    )
  }

  if (showListingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <ListingForm onSuccess={handleListingSuccess} onCancel={() => setShowListingForm(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My NFTs
            </h1>
            <p className="text-gray-600 text-lg">Manage your digital asset collection</p>
          </div>
          <button
            onClick={() => setShowListingForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>List New NFT</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab("owned")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                  activeTab === "owned"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Owned ({myNFTs.owned.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("listed")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                  activeTab === "listed"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span>Listed ({myNFTs.listed.length})</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
                      <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeTab === "owned" ? (
                  myNFTs.owned.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Owned NFTs</h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                        You don't own any NFTs yet. Explore the marketplace to discover and purchase unique digital
                        assets!
                      </p>
                      <button
                        onClick={() => (window.location.href = "/")}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Browse Marketplace
                      </button>
                    </div>
                  ) : (
                    myNFTs.owned.map((nft) => <NFTCard key={nft.mint} nft={nft as ListingData} />)
                  )
                ) : myNFTs.listed.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No Listed NFTs</h3>
                    <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                      You haven't listed any NFTs for sale yet. Start earning by listing your digital assets!
                    </p>
                    <button
                      onClick={() => setShowListingForm(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      List Your First NFT
                    </button>
                  </div>
                ) : (
                  myNFTs.listed.map((listing) => (
                    <NFTCard key={listing.listingAccount} nft={listing} onDelist={handleDelist} isOwner={true} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyNFTs
