"use client"

import type React from "react"
import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { initializeProgram } from "../lib/anchor-client"

const Admin: React.FC = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [initForm, setInitForm] = useState({
    name: "",
    fee: "",
  })
  const [feeUpdateForm, setFeeUpdateForm] = useState({
    newFee: "",
  })

  const initializeMarketplace = async () => {
    if (!wallet || !wallet.publicKey) {
      alert('Please connect your wallet.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { program } = initializeProgram(wallet, connection);

      // Derive marketplace PDA
      const [marketplacePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('marketplace')],
        program.programId
      );

      // Derive treasury PDA
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        program.programId
      );

      if (!marketplacePda || !treasuryPda) {
        alert('Failed to derive PDAs.');
        setIsLoading(false);
        return;
      }

      // Add debug log for all accounts
      console.log({
        admin: wallet.publicKey,
        marketplace: marketplacePda,
        treasury: treasuryPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      });

      const tx = await program.methods
        .initializeMarketplace(initForm.name, parseInt(initForm.fee))
        .accounts({
          admin: wallet.publicKey,
          marketplace: marketplacePda,
          treasury: treasuryPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Marketplace initialized:", tx)
      alert("Marketplace initialized successfully!")
    } catch (error) {
      console.error("Error initializing marketplace:", error)
      alert("Failed to initialize marketplace")
    } finally {
      setIsLoading(false)
    }
  }

  const updateMarketplaceFee = async () => {
    if (!wallet.connected || !wallet.publicKey) return
    setIsLoading(true)
    try {
      // ✅ FIX: Pass the entire wallet object instead of wallet.adapter
      const { program } = initializeProgram(wallet, connection)

      // Derive marketplace PDA
      const [marketplacePda] = PublicKey.findProgramAddressSync([Buffer.from("marketplace")], program.programId)

      const tx = await program.methods
        .updateFee(Number.parseInt(feeUpdateForm.newFee))
        .accounts({
          admin: wallet.publicKey,
          marketplace: marketplacePda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc()

      console.log("Fee updated:", tx)
      alert("Marketplace fee updated successfully!")
    } catch (error) {
      console.error("Error updating fee:", error)
      alert("Failed to update marketplace fee")
    } finally {
      setIsLoading(false)
    }
  }

  if (!wallet.connected || !wallet.publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 leading-relaxed">
            Please connect your admin wallet to access the marketplace administration panel
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 text-lg">Manage your NFT marketplace settings and configuration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Initialize Marketplace */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Initialize Marketplace</h2>
                <p className="text-gray-600">Set up your marketplace for the first time</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Marketplace Name</label>
                <input
                  type="text"
                  value={initForm.name}
                  onChange={(e) => setInitForm({ ...initForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-900"
                  placeholder="My NFT Marketplace"
                  maxLength={32}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Fee (Basis Points)</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={initForm.fee}
                  onChange={(e) => setInitForm({ ...initForm, fee: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-900"
                  placeholder="250 (2.5%)"
                />
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">💡 1 basis point = 0.01%. Maximum 10,000 (100%)</p>
                </div>
              </div>

              <button
                onClick={initializeMarketplace}
                disabled={isLoading || !initForm.name || !initForm.fee}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    Initializing...
                  </div>
                ) : (
                  "Initialize Marketplace"
                )}
              </button>
            </div>
          </div>

          {/* Update Fee */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Update Marketplace Fee</h2>
                <p className="text-gray-600">Modify the current marketplace fee</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">New Fee (Basis Points)</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={feeUpdateForm.newFee}
                  onChange={(e) => setFeeUpdateForm({ ...feeUpdateForm, newFee: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-900"
                  placeholder="500 (5%)"
                />
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-700 font-medium">
                    ⚠️ Current marketplace fee will be updated to this value
                  </p>
                </div>
              </div>

              <button
                onClick={updateMarketplaceFee}
                disabled={isLoading || !feeUpdateForm.newFee}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    Updating...
                  </div>
                ) : (
                  "Update Fee"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Marketplace Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Marketplace Information</h2>
              <p className="text-gray-600">Current marketplace configuration details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <div className="text-sm font-semibold text-indigo-600 mb-2">Program ID</div>
              <div className="font-mono text-sm text-gray-900 break-all bg-white p-3 rounded-lg border">
                {import.meta.env.VITE_PROGRAM_ID}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="text-sm font-semibold text-green-600 mb-2">Admin Wallet</div>
              <div className="font-mono text-sm text-gray-900 break-all bg-white p-3 rounded-lg border">
                {wallet.publicKey?.toString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <div className="text-sm font-semibold text-blue-600 mb-2">Network</div>
              <div className="flex items-center bg-white p-3 rounded-lg border">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-900 font-medium">Mainnet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
