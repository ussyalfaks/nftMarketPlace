import type React from "react"
import { Link } from "react-router-dom"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              NFT Marketplace
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-indigo-50"
              >
                Marketplace
              </Link>
              <Link
                to="/my-nfts"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-indigo-50"
              >
                My NFTs
              </Link>
              <Link
                to="/admin"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-indigo-50"
              >
                Admin
              </Link>
            </div>
          </div>
          <div className="wallet-adapter-button-trigger">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
