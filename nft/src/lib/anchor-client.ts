// src/lib/anchor-client.ts
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { AnchorNftMarketplace } from '../types/marketplace';

// IDL (Interface Definition Language) - Generated from your ABI
export const IDL: AnchorNftMarketplace = {
  version: '0.1.0',
  name: 'anchor_nft_marketplace',
  instructions: [
    {
      name: 'initializeMarketplace',
      accounts: [
        { name: 'admin', isMut: true, isSigner: true },
        { name: 'marketplace', isMut: true, isSigner: false },
        { name: 'treasury', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'name', type: 'string' },
        { name: 'fee', type: 'u16' }
      ]
    },
    {
      name: 'listNft',
      accounts: [
        { name: 'maker', isMut: true, isSigner: true },
        { name: 'marketplace', isMut: true, isSigner: false },
        { name: 'makerNftMint', isMut: true, isSigner: false },
        { name: 'makerNftAta', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'metadata', isMut: true, isSigner: false },
        { name: 'masterEdition', isMut: true, isSigner: false },
        { name: 'metadataProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false }
      ],
      args: [{ name: 'price', type: 'u64' }]
    },
    {
      name: 'purchaseNft',
      accounts: [
        { name: 'taker', isMut: true, isSigner: true },
        { name: 'maker', isMut: true, isSigner: false },
        { name: 'makerNftMint', isMut: false, isSigner: false },
        { name: 'marketplace', isMut: false, isSigner: false },
        { name: 'takerAta', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'treasury', isMut: true, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: 'delistNft',
      accounts: [
        { name: 'maker', isMut: true, isSigner: true },
        { name: 'marketplace', isMut: false, isSigner: false },
        { name: 'makerNftMint', isMut: false, isSigner: false },
        { name: 'makerNftAta', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'metadata', isMut: true, isSigner: false },
        { name: 'masterEdition', isMut: false, isSigner: false },
        { name: 'metadataProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: 'updateFee',
      accounts: [
        { name: 'admin', isMut: true, isSigner: true },
        { name: 'marketplace', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false }
      ],
      args: [{ name: 'updatedFee', type: 'u16' }]
    }
  ]
  // ... rest of IDL would be populated from your ABI
};

// Initialize Anchor Program
export const initializeProgram = (wallet: any, connection: Connection) => {
  // ✅ FIX 1: Add proper error handling and validation for environment variable
  const programIdString = import.meta.env.VITE_PROGRAM_ID;
  
  if (!programIdString) {
    throw new Error('VITE_PROGRAM_ID environment variable is not set');
  }

  // ✅ FIX 2: Validate that the program ID is a valid public key
  let programId: PublicKey;
  try {
    programId = new PublicKey(programIdString);
  } catch (error) {
    throw new Error(`Invalid VITE_PROGRAM_ID: ${programIdString}. Must be a valid Solana public key.`);
  }

  // ✅ FIX 3: Create proper wallet object with required methods
  const walletAdapter = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };

  const provider = new AnchorProvider(connection, walletAdapter, {
    commitment: 'confirmed',
  });
  
  // ✅ FIX 4: Remove unnecessary type assertions - Anchor handles typing internally
  const program = new Program(IDL, programId, provider);
  
  return { program, provider };
};

export class MarketplaceClient {
  program: Program;
  provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    const { program, provider } = initializeProgram(wallet, connection);
    this.program = program;
    this.provider = provider;
  }

  async initializeMarketplace(name: string, fee: number, admin: PublicKey) {
    // Derive PDAs
    const [marketplacePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace')],
      this.program.programId
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('treasury')],
      this.program.programId
    );
    return await this.program.methods
      .initializeMarketplace(name, fee)
      .accounts({
        admin,
        marketplace: marketplacePda,
        treasury: treasuryPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  async updateFee(newFee: number, admin: PublicKey) {
    const [marketplacePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace')],
      this.program.programId
    );
    return await this.program.methods
      .updateFee(newFee)
      .accounts({
        admin,
        marketplace: marketplacePda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }
}