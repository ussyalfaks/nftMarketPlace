import { PublicKey } from '@solana/web3.js';

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatSOL = (lamports: number): string => {
  return (lamports / 1_000_000_000).toFixed(2);
};

export const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};
