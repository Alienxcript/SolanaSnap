// app/contexts/WalletContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

interface WalletContextType {
  publicKey: string | null;
  balance: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const pubKey = new PublicKey(publicKey);
        const lamports = await connection.getBalance(pubKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      await transact(async (wallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolanaSnap',
            uri: 'https://solanasnap.app',
            icon: 'favicon.ico',
          },
        });

        if (!authResult.accounts || authResult.accounts.length === 0) {
          throw new Error('No accounts returned from wallet');
        }

        const account = authResult.accounts[0];
        
        // ✅ CORRECT METHOD: Use native atob to decode base64 to bytes
        // MWA returns the public key as a base64-encoded string
        const binaryString = atob(account.address);
        const bytesArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytesArray[i] = binaryString.charCodeAt(i);
        }
        
        // Create PublicKey from the decoded bytes
        const pubKey = new PublicKey(bytesArray);
        const base58Address = pubKey.toBase58();
        
        console.log('✅ Wallet connected:', base58Address);
        setPublicKey(base58Address);
      });
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setPublicKey(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setBalance(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        balance,
        isConnected: publicKey !== null,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const formatPublicKey = (publicKey: string | null): string => {
  if (!publicKey) return '';
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};

export const formatSOL = (amount: number | null): string => {
  if (amount === null) return '0 SOL';
  return `${amount.toFixed(4)} SOL`;
};
