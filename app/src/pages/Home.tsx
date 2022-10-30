// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { PublicKey } from "@solana/web3.js";
import { utils, web3, BN } from '@project-serum/anchor';
import { Buffer } from 'buffer';
import useWallet from "./useWallet";
import useWorkspace from "./useWorkspace";
import Button from '@mui/material/Button';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import usePool from './usePool';

const { SystemProgram } = web3;
window.Buffer = Buffer;

document.body.style.backgroundColor = "rgb(0, 30, 60)";

const StyledWindow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Home = () => {
    const [loans, setLoans] = useState([]);
    const [walletAddress, connectWallet, checkIfWalletIsConnected] = useWallet();
    const [connection, provider, programID, program] = useWorkspace();
    const [findPool] = usePool();
    const navigate = useNavigate();
    const [poolPubkey, setPool] = useState();

    const createPool = async () => {
        try {
          // program derived account, bumps and seeds used for calculating the address of our campaing account
        const pool = await findPool();
        console.log(pool);
          await program.rpc.createPool({
            accounts: {
              pool,
              user: provider.wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
          });
          setPool(pool);
          console.log('Created a new pool w/ address:', pool.toString());
        } catch(error) {
          console.log('Error creating pool account:', error);
        }
    }
    console.log(poolPubkey);
    const initPool = () => {
        if (poolPubkey === undefined) {
            createPool();
            console.log(poolPubkey);
        } else {
            alert("Pool already exists");
        }
    }
    
    useEffect(() => {
      const onLoad = async() => {
        await checkIfWalletIsConnected();
      }
      window.addEventListener('load', onLoad)
      return () => window.removeEventListener("load", onLoad);
    }, []);

    const getLoans = async() => {
        Promise.all(
          (await connection.getProgramAccounts(programID)).map(
            async (loan) => ({
            pubkey: loan.pubkey,
            ...(await program.account.loan.fetch(loan.pubkey)),
          })
          )
        ).then(loans => setLoans(loans));
        console.log(programID, loans);
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
        <Button variant="contained" onClick={connectWallet}>Connect to Wallet</Button>
      )
    const renderConnectedContainer = () => (
    <>
        <Button variant="contained" onClick={() => navigate("/invest")}>Invest</Button>
        <Button variant="outlined" onClick={() => navigate("/apply")}>Apply for a loan</Button>
        
        <Button variant="outlined" onClick={initPool}>Initialize the application</Button>
        
        {/* <button onClick={getLoans}>Get a list of loans...</button> */}
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

    return (
    <StyledWindow>
        {!walletAddress && renderNotConnectedContainer()}
        {walletAddress && renderConnectedContainer()}
    </StyledWindow>
    )
};
  
export default Home;
  