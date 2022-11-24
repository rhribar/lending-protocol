// @ts-nocheck
import React, { useState } from 'react';
import { PublicKey } from "@solana/web3.js";
import { utils, web3, BN } from '@project-serum/anchor';
import useWorkspace from './useWorkspace';

const { SystemProgram } = web3;

export const POOL_PROGRAM = new web3.PublicKey(
  "HzGTJxHA4sZZGUU1V6ZaLtJwid9tiyKcapJzwP334js3"
);
const PREFIX = "POOL";

const usePool = () => {
  const [connection, provider, programID, program] = useWorkspace();

  const findPool = async () => {
    const [pool] = await PublicKey.findProgramAddress(
      [ 
        utils.bytes.utf8.encode(PREFIX),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    console.log(POOL_PROGRAM, program.programId);
    return pool;
  }

  return [findPool, POOL_PROGRAM];
}
export default usePool;