import type React from "react"

interface MarketplaceStatsProps {
  totalNFTs: number
  totalVolume: number
}

const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({ totalNFTs, totalVolume }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start mb-2">
          <div className="p-3 bg-indigo-100 rounded-xl mr-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{totalNFTs.toLocaleString()}</div>
            <div className="text-gray-600 text-sm font-medium">NFTs Listed</div>
          </div>
        </div>
      </div>

      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start mb-2">
          <div className="p-3 bg-purple-100 rounded-xl mr-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{totalVolume.toLocaleString()} SOL</div>
            <div className="text-gray-600 text-sm font-medium">Total Volume</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default MarketplaceStats
