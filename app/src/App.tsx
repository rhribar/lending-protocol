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
  const [campaigns, setCampaigns] = useState([]);
  const [walletAddress, connectWallet, checkIfWalletIsConnected] = useWallet();
  const [connection, provider, programID, program] = useWorkspace();

  const getCampaigns = async() => {
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(
        async (campaign) => ({
        pubkey: campaign.pubkey,
        ...(await program.account.campaign.fetch(campaign.pubkey)),
      })
      )
    ).then(campaigns => setCampaigns(campaigns));
    /* console.log(await connection.getProgramAccounts(programID));
    console.log(program.account.campaign); */
    /* setCampaigns(await connection.getProgramAccounts(programID)); */
  } 

  const createCampaign = async () => {
    try {
      // program derived account, bumps and seeds used for calculating the address of our campaing account
      const [campaign] = await PublicKey.findProgramAddress(
        [ 
          utils.bytes.utf8.encode("CAMPAIGN"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      await program.rpc.create('campaign name', 'campaign description', {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log('Created a new campaign w/ address:', campaign.toString());
    } catch(error) {
      console.error('Error creating campaign account:', error);
    }
  }

  const donate = async publicKey => {
    try {
      await program.rpc.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log('Donated soem money to:', publicKey.toString());
      getCampaigns();
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  const withdraw = async publicKey => {
    try {
      await program.rpc.withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log('WIthdrew some money from:', publicKey.toString());
    } catch (error) {
      console.error("error withdrawing:", error);
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  )
  const renderConnectedContainer = () => (
    <>
      <button onClick={createCampaign}>Create a campaign</button>
      <button onClick={getCampaigns}>Get a list of campaigns...</button>
      <br />
      {campaigns.map(campaign => <>
        <p>Campaign ID: {campaign.pubkey.toString()}</p>
        <p>Balance: {(campaign.amountDonated / web3.LAMPORTS_PER_SOL).toString()}</p>
        <p>{campaign.name}</p>
        <p>{campaign.description}</p>
        <button onClick={() => donate(campaign.pubkey)}>Click to donate!</button>
        <button onClick={() => withdraw(campaign.pubkey)}>Click to withdraw!</button>
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
