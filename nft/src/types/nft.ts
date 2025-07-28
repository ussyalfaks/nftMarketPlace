
// src/types/nft.ts
export interface NFT {
    mint: string;
    name: string;
    symbol: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
    owner?: string;
    listed?: boolean;
    price?: number;
  }
  
  export interface ListingData extends NFT {
    seller: string;
    listingAccount: string;
    timestamp: number;
  }
  