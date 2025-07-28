import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID);

export const getMarketplacePDA = () =>
  PublicKey.findProgramAddressSync([Buffer.from('marketplace')], PROGRAM_ID)[0];

export const getListingPDA = (nftMint: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from('listing'), nftMint.toBuffer()], PROGRAM_ID)[0];

export const getVaultPDA = (nftMint: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from('vault'), nftMint.toBuffer()], PROGRAM_ID)[0];
