import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import { QueryClient, QueryClientProvider } from "react-query"
import Marketplace from "./pages/Marketplace"
import MyNFTs from "./pages/MyNFTs"
import Admin from "./pages/Admin"
import Navbar from "./components/Navbar"
import "@solana/wallet-adapter-react-ui/styles.css"

const queryClient = new QueryClient()

function App() {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network)
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              {/* <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"> */}
                <Navbar />
                <main className=" mx-auto px-6 py-5">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                    <Routes>
                      <Route path="/" element={<Marketplace />} />
                      <Route path="/my-nfts" element={<MyNFTs />} />
                      <Route path="/admin" element={<Admin />} />
                    </Routes>
                  </div>
                </main>
              {/* </div> */}
            </Router>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
