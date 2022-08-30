// @ts-nocheck
import { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, AnchorProvider, web3, utils, BN } from "@project-serum/anchor";
import idl from "./idl.json";
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);
//const network = clusterApiUrl("devnet");
const network = "http://127.0.0.1:8899";
const opts = {
  preflightCommitment: "processed",
};

const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, (window as any).solana, opts.preflightCommitment);
    return provider;
  }

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

  const logger = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      // program derived account, bumps and seeds used for calculating the address of our campaing account
      const [log] = await PublicKey.findProgramAddress(
        [ 
          utils.bytes.utf8.encode("CAMPAIG"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      await program.rpc.logger('logging', {
        accounts: {
          log,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log(provider.wallet.publicKey);
    } catch(error) {
      console.error('Error creating campaign account:', error);
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  )
  const renderConnectedContainer = () => (
    <>
      <button onClick={logger}>Create a campaign</button>
    </>
  )
  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App">
    {!walletAddress && renderNotConnectedContainer()}
    {walletAddress && renderConnectedContainer()}
    </div>
}

export default App;
