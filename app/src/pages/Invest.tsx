// @ts-nocheck
import Button from '@mui/material/Button';
import useWorkspace from './useWorkspace';
import { utils, web3, BN } from '@project-serum/anchor';
import { useState } from 'react';
import styled from 'styled-components';
import usePool from './usePool';
import { TextField } from '@mui/material';

const { SystemProgram } = web3;
window.Buffer = Buffer;

const StyledWindow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Invest = () => {
    const [connection, provider, programID, program] = useWorkspace();
    const [poolPubkey, setPool] = useState();
    const [findPool] = usePool();

    const fundPool = async () => {
        try {
          const pool = await findPool();
          await program.rpc.fundPool(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
            accounts: {
              pool: pool,
              user: provider.wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
          });
          console.log('Donated soem money to:', pool.toString());
        } catch (error) {
          console.error("Error donating:", error);
        }
    };

    const withdrawFromPool = async () => {
        try {
          await program.rpc.withdrawFunds(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
            accounts: {
              pool: poolPubkey,
              user: provider.wallet.publicKey,
            },
          });
          console.log('Withdrew some money from:', poolPubkey.toString());
        } catch (error) {
          console.error("error withdrawing:", error);
        }
    }
    
    return (
        <StyledWindow>
            <h1>Here is where you invest</h1>
            <TextField id="filled-basic" label="Filled" variant="filled" />
            <Button variant="contained" onClick={fundPool}>Fund a pool</Button>
            <Button variant="outlined" onClick={withdrawFromPool}>Withdraw from a pool</Button>
        </StyledWindow>
    )
};
export default Invest;
  