import { useCallback } from 'react';
import type { NFT } from '../types/nft';

export const useNFTOperations = () => {
  // Placeholder: implement fetching owned NFTs from token accounts
  const fetchOwnedNFTs = useCallback(async (publicKey: string): Promise<NFT[]> => {
    // TODO: Implement real logic
    return [];
  }, []);

  const fetchNFTMetadata = useCallback(async (uri: string) => {
    const res = await fetch(uri);
    return res.json();
  }, []);

  return { fetchOwnedNFTs, fetchNFTMetadata };
};
