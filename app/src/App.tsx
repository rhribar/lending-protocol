// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { PublicKey } from "@solana/web3.js";
import { utils, web3, BN } from '@project-serum/anchor';
import { Buffer } from 'buffer';
import useWallet from "./useWallet";
import useWorkspace from "./useWorkspace";

const { SystemProgram } = web3;
window.Buffer = Buffer;

const App = () => {
  const [loans, setLoans] = useState([]);
  const [walletAddress, connectWallet, checkIfWalletIsConnected] = useWallet();
  const [connection, provider, programID, program] = useWorkspace();

  const getLoans = async() => {
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(
        async (loan) => ({
        pubkey: loan.pubkey,
        ...(await program.account.loan.fetch(loan.pubkey)),
      })
      )
    ).then(loans => setLoans(loans));
  } 

  const createLoan= async () => {
    try {
      // program derived account, bumps and seeds used for calculating the address of our campaing account
      const [loan] = await PublicKey.findProgramAddress(
        [ 
          utils.bytes.utf8.encode("LOAN"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      await program.rpc.createApplication('loan name', 'loan description', {
        accounts: {
          loan,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log('Created a new loans w/ address:', loan.toString());
    } catch(error) {
      console.error('Error creating loans account:', error);
    }
  }

  const loanOut = async publicKey => {
    try {
      await program.rpc.loanFunds(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          loan: publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log('Donated soem money to:', publicKey.toString());
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  const withdraw = async publicKey => {
    try {
      await program.rpc.withdrawFunds(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          loan: publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log('Withdrew some money from:', publicKey.toString());
    } catch (error) {
      console.error("error withdrawing:", error);
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  )
  const renderConnectedContainer = () => (
    <>
      <button onClick={createLoan}>Create a loan</button>
      <button onClick={getLoans}>Get a list of loans...</button>
      <br />
      {loans.map(loan => <>
        <p>Loan ID: {loan.pubkey.toString()}</p>
        <p>Balance: {(loan.amountLoaned / web3.LAMPORTS_PER_SOL).toString()}</p>
        {console.log(loan.amountLoaned)}
        <p>{loan.name}</p>
        <p>{loan.description}</p>
        <button onClick={() => loanOut(loan.pubkey)}>Click to loan!</button>
        <button onClick={() => withdraw(loan.pubkey)}>Click to withdraw!</button>
      <br />
      </>)}
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
