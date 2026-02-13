// app/hooks/useWallet.ts
import { useState, useCallback } from 'react';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const useWallet = () => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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

        const pubKey = new PublicKey(authResult.accounts[0].address);
        setPublicKey(pubKey);
        setIsConnected(true);

        // Get balance
        const bal = await connection.getBalance(pubKey);
        setBalance(bal / 1e9);
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
    setBalance(null);
  }, []);

  return {
    publicKey,
    isConnected,
    balance,
    isConnecting,
    connect,
    disconnect,
  };
};

export const formatPublicKey = (publicKey: PublicKey | null): string => {
  if (!publicKey) return '';
  const key = publicKey.toBase58();
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

export const formatSOL = (amount: number | null): string => {
  if (amount === null) return '0 SOL';
  return `${amount.toFixed(4)} SOL`;
};
