// @ts-nocheck
import React from 'react';
import idl from "./idl.json";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from '@project-serum/anchor';

const useWorkspace = () => {
    const network = "http://127.0.0.1:8899";
    const commitment = "processed";
    const IDL = JSON.parse(JSON.stringify(idl)); // BUG with importing

    const opts = { preflightCommitment: commitment };
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    const programID = new PublicKey(IDL.metadata.address);
    const program = new Program(IDL, programID, provider);

    return [connection, provider, programID, program];
}

export default useWorkspace;