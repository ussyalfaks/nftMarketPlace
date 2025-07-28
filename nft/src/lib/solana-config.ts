
// src/lib/solana-config.ts
import { Connection } from '@solana/web3.js';

export const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC_URL,
  'confirmed'
);

export const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID;