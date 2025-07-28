// src/hooks/useMarketplace.ts
import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { initializeProgram } from '../lib/anchor-client';

export const useMarketplace = () => {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const listNFT = useCallback(async (nftMint: string, price: number) => {
    if (!wallet || !publicKey) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      const { program } = initializeProgram(wallet.adapter, connection);
      
      const nftMintPubkey = new PublicKey(nftMint);
      const priceInLamports = price * LAMPORTS_PER_SOL;
      
      // Derive marketplace PDA
      const [marketplacePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('marketplace')],
        program.programId
      );
      
      // Derive listing PDA
      const [listingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), nftMintPubkey.toBuffer()],
        program.programId
      );
      
      // Derive vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), nftMintPubkey.toBuffer()],
        program.programId
      );
      
      // Get associated token account
      const makerNftAta = await getAssociatedTokenAddress(nftMintPubkey, publicKey);
      
      // Get metadata account
      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          nftMintPubkey.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );
      
      // Get master edition account
      const [masterEditionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          nftMintPubkey.toBuffer(),
          Buffer.from('edition')
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );
      
      const tx = await program.methods
        .listNft(priceInLamports)
        .accounts({
          maker: publicKey,
          marketplace: marketplacePda,
          makerNftMint: nftMintPubkey,
          makerNftAta,
          vault: vaultPda,
          listing: listingPda,
          metadata: metadataPda,
          masterEdition: masterEditionPda,
          metadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, publicKey, connection]);

  const purchaseNFT = useCallback(async (nftMint: string, seller: string) => {
    if (!wallet || !publicKey) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      const { program } = initializeProgram(wallet.adapter, connection);
      
      const nftMintPubkey = new PublicKey(nftMint);
      const sellerPubkey = new PublicKey(seller);
      
      // Derive accounts
      const [marketplacePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('marketplace')],
        program.programId
      );
      
      const [listingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), nftMintPubkey.toBuffer()],
        program.programId
      );
      
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), nftMintPubkey.toBuffer()],
        program.programId
      );
      
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        program.programId
      );
      
      const takerAta = await getAssociatedTokenAddress(nftMintPubkey, publicKey);
      
      const tx = await program.methods
        .purchaseNft()
        .accounts({
          taker: publicKey,
          maker: sellerPubkey,
          makerNftMint: nftMintPubkey,
          marketplace: marketplacePda,
          takerAta,
          vault: vaultPda,
          listing: listingPda,
          treasury: treasuryPda,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: new PublicKey('11111111111111111111111111111111')
        })
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, publicKey, connection]);

  const delistNFT = useCallback(async (nftMint: string) => {
    if (!wallet || !publicKey) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      const { program } = initializeProgram(wallet.adapter, connection);
      
      const nftMintPubkey = new PublicKey(nftMint);
      
      // Similar PDA derivations as listNFT
      const [marketplacePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('marketplace')],
        program.programId
      );
      
      const [listingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('listing'), nftMintPubkey.toBuffer()],
        program.programId
      );
      
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), nftMintPubkey.toBuffer()],
        program.programId
      );
      
      const makerNftAta = await getAssociatedTokenAddress(nftMintPubkey, publicKey);
      
      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          nftMintPubkey.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );
      
      const [masterEditionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          nftMintPubkey.toBuffer(),
          Buffer.from('edition')
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );
      
      const tx = await program.methods
        .delistNft()
        .accounts({
          maker: publicKey,
          marketplace: marketplacePda,
          makerNftMint: nftMintPubkey,
          makerNftAta,
          vault: vaultPda,
          listing: listingPda,
          metadata: metadataPda,
          masterEdition: masterEditionPda,
          metadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error delisting NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, publicKey, connection]);

  return {
    listNFT,
    purchaseNFT,
    delistNFT,
    isLoading
  };
};