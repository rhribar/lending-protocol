// @ts-nocheck
import React, { useState } from 'react';
import { PublicKey } from "@solana/web3.js";
import { utils, web3, BN } from '@project-serum/anchor';
import useWorkspace from './useWorkspace';

const { SystemProgram } = web3;

const usePool = () => {
    const [poolPubkey, setPool] = useState();
    const [connection, provider, programID, program] = useWorkspace();

    const findPool = async () => {
      const [pool] = await PublicKey.findProgramAddress(
          [ 
          utils.bytes.utf8.encode("POOL"),
          provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
      );
      console.log(pool, poolPubkey);
      return pool;
  }

  return [findPool];
}
export default usePool;