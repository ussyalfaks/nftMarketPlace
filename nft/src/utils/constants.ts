
// src/utils/constants.ts
export const MARKETPLACE_ERRORS = {
    6000: 'The name shouldn\'t be empty or exceed 32 characters.',
    6001: 'The fee cannot exceed 10,000 basis points (100%).',
    6002: 'The listing price must be greater than zero.',
    6003: 'The listing owner does not match the signer.',
  };
  
  export const TOKEN_METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
  export const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';
  
  // src/utils/helpers.ts
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