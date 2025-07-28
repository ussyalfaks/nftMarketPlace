// src/types/marketplace.ts
export interface AnchorNftMarketplace {
  version: string;
  name: string;
  instructions: Array<{
    name: string;
    accounts: Array<{
      name: string;
      isMut: boolean;
      isSigner: boolean;
    }>;
    args: Array<{
      name: string;
      type: string;
    }>;
  }>;
  accounts?: Array<{
    name: string;
    type: {
      kind: string;
      fields: Array<{
        name: string;
        type: string;
      }>;
    };
  }>;
  events?: Array<{
    name: string;
    fields: Array<{
      name: string;
      type: string;
      index: boolean;
    }>;
  }>;
  errors?: Array<{
    code: number;
    name: string;
    msg: string;
  }>;
}

export interface Listing {
  maker: string;
  nftMint: string;
  price: number;
  metadata: string;
  bump: number;
}

export interface Marketplace {
  authority: string;
  feeBps: number;
  marketplaceBump: number;
  treasury: string;
  treasuryBump: number;
  name: string;
}
