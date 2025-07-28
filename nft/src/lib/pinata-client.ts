// src/lib/pinata-client.ts
import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
  };
}

class PinataClient {
  private baseURL = 'https://api.pinata.cloud';

  private getHeaders() {
    return {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
    };
  }

  async uploadFile(file: File): Promise<PinataResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${this.baseURL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async uploadJSON(metadata: NFTMetadata): Promise<PinataResponse> {
    const response = await axios.post(
      `${this.baseURL}/pinning/pinJSONToIPFS`,
      metadata,
      {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async uploadNFTWithMetadata(
    imageFile: File,
    metadata: Omit<NFTMetadata, 'image'>
  ): Promise<{ imageHash: string; metadataHash: string }> {
    // Upload image first
    const imageResponse = await this.uploadFile(imageFile);
    const imageHash = imageResponse.IpfsHash;

    // Create complete metadata with IPFS image URL
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      properties: {
        files: [
          {
            uri: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
            type: imageFile.type,
          },
        ],
        category: 'image',
      },
    };

    // Upload metadata
    const metadataResponse = await this.uploadJSON(completeMetadata);
    const metadataHash = metadataResponse.IpfsHash;

    return {
      imageHash,
      metadataHash,
    };
  }

  getIPFSUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}

export const pinataClient = new PinataClient();
