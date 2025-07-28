import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';

// Set up the network
const network = 'devnet';
const endpoint = clusterApiUrl(network);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<ConnectionProvider endpoint={endpoint}>
      <App />
    </ConnectionProvider>  </StrictMode>,
)
