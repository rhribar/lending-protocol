import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, ConfirmOptions, Commitment } from "@solana/web3.js";
// import idl from "../../target/idl/lending_protocol.json";
import idl from "./lending_protocol.json";
import { AnchorProvider, utils, web3 } from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Buffer } from 'buffer';
const { SystemProgram } = web3;
window.Buffer = Buffer;


const programID = new PublicKey(idl.metadata.address);
const network = "http://127.0.0.1:8899";
const opts = {
  preflightCommitment: 'processed',
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const getProvider = () => {
    const connection = new Connection(network, 'processed');
    const provider = new AnchorProvider(connection, (window as any).solana, (opts.preflightCommitment as ConfirmOptions));
    return provider;
  }
  console.log(programID);

  const checkIfWalletIsConnected = async() => {
    try {
      const { solana } = window as any;
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

  const connectWallet = async () => {
    const { solana } = window as any;
    if (solana) {
      const response = solana.connect();
      console.log('Connected with public key:', response.publicKey.toString());
      setWalletAddress(response.publicKey);
    }
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  )
  const renderConnectedContainer = () => (
    <>
      <button onClick={() => init()}>Connected!</button>
    </>
  )
  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const init = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl as any, programID, provider);
      const [log] = await PublicKey.findProgramAddress(
        [ 
          utils.bytes.utf8.encode("CAMPAIGN"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      // @ts-ignore
      await program.rpc.logger('logging', {
        accounts: {
          log,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log('Hello back!');
    } catch(error) {
      console.error('Error creating campaign account:', error);
    }
  }

  return (
    <div className="App">
      <h1>Hi</h1>
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </div>
  );
}

export default App;
