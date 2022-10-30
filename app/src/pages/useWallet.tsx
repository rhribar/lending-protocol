// @ts-nocheck
import React, { useState } from 'react';

const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = solana.connect();
      console.log('Connected with public key:', response.publicKey.toString());
      setWalletAddress(response.publicKey);
    }
  };

  const checkIfWalletIsConnected = async() => {
    try {
      const { solana } = window;
      if (solana.isPhantom) { 
        console.log("Phantom wallet found");
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log("public key", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Solana object not found! Get a Phantom wallet")
      }
    } catch(error) {
      console.error(error);
    }
  };

  return [walletAddress, connectWallet, checkIfWalletIsConnected];
}
export default useWallet;