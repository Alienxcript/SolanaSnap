// app/contexts/WalletContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { decode as base64Decode } from 'js-base64';
import bs58 from 'bs58';

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
    console.log('🔵 [1] Connect button pressed');
    setIsConnecting(true);

    try {
      console.log('🔵 [2] Starting transact...');
      
      await transact(async (wallet) => {
        console.log('🔵 [3] Inside transact callback');
        
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolanaSnap',
            uri: 'https://solanasnap.app',
            icon: 'favicon.ico',
          },
        });
        
        console.log('🔵 [4] Auth result received');

        if (!authResult.accounts || authResult.accounts.length === 0) {
          throw new Error('No accounts returned');
        }

        const account = authResult.accounts[0];
        const rawAddress = account.address;
        
        console.log('🔵 [5] Raw address from MWA:', rawAddress);
        console.log('🔵 [5a] Address type:', typeof rawAddress);
        console.log('🔵 [5b] Address length:', rawAddress.length);
        
        // METHOD 1: Try treating it as already base58
        console.log('\n🔵 METHOD 1: Treating as base58 directly');
        try {
          const pubKey1 = new PublicKey(rawAddress);
          const addr1 = pubKey1.toBase58();
          console.log('✅ Method 1 result:', addr1);
        } catch (e) {
          console.log('❌ Method 1 failed:', e.message);
        }

        // METHOD 2: Decode as base64, then convert to base58
        console.log('\n🔵 METHOD 2: Decode base64 -> bytes -> base58');
        try {
          const decoded = base64Decode(rawAddress);
          const bytesArray = new Uint8Array(decoded.length);
          for (let i = 0; i < decoded.length; i++) {
            bytesArray[i] = decoded.charCodeAt(i);
          }
          const pubKey2 = new PublicKey(bytesArray);
          const addr2 = pubKey2.toBase58();
          console.log('✅ Method 2 result:', addr2);
        } catch (e) {
          console.log('❌ Method 2 failed:', e.message);
        }

        // METHOD 3: Decode as base64 and treat result as base58
        console.log('\n🔵 METHOD 3: Decode base64 -> treat as base58');
        try {
          const decoded = base64Decode(rawAddress);
          const pubKey3 = new PublicKey(decoded);
          const addr3 = pubKey3.toBase58();
          console.log('✅ Method 3 result:', addr3);
        } catch (e) {
          console.log('❌ Method 3 failed:', e.message);
        }

        // METHOD 4: Decode base64 as Uint8Array directly
        console.log('\n🔵 METHOD 4: Base64 -> Uint8Array (atob)');
        try {
          // Use browser's atob or Buffer
          const binaryString = atob(rawAddress);
          const bytesArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytesArray[i] = binaryString.charCodeAt(i);
          }
          const pubKey4 = new PublicKey(bytesArray);
          const addr4 = pubKey4.toBase58();
          console.log('✅ Method 4 result:', addr4);
        } catch (e) {
          console.log('❌ Method 4 failed:', e.message);
        }

        // METHOD 5: Use bs58 decode on raw address
        console.log('\n🔵 METHOD 5: bs58 decode raw address');
        try {
          const bytes = bs58.decode(rawAddress);
          const pubKey5 = new PublicKey(bytes);
          const addr5 = pubKey5.toBase58();
          console.log('✅ Method 5 result:', addr5);
        } catch (e) {
          console.log('❌ Method 5 failed:', e.message);
        }

        console.log('\n🔵 YOUR PHANTOM ADDRESS: Ae3CduDrqbDJW5gQm4zJPftcYrrUMEx6AAVUonhzeGGs');
        console.log('🔵 Compare each method above to find which matches!');
        
        // For now, use Method 2 (what we had before)
        const decoded = base64Decode(rawAddress);
        const bytesArray = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          bytesArray[i] = decoded.charCodeAt(i);
        }
        const pubKey = new PublicKey(bytesArray);
        const finalAddress = pubKey.toBase58();
        
        console.log('\n🔵 [6] Using address:', finalAddress);
        setPublicKey(finalAddress);
      });
      
      console.log('🔵 [7] ✅ Transact completed');
      
    } catch (error) {
      console.error('🔴 ERROR:', error);
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
