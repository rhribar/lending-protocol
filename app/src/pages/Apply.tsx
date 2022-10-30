// @ts-nocheck
import Button from '@mui/material/Button';
import useWorkspace from './useWorkspace';
import { utils, web3, BN } from '@project-serum/anchor';
import { useState } from 'react';
import styled from 'styled-components';

const StyledWindow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const { SystemProgram } = web3;
window.Buffer = Buffer;

const Apply = () => {
    const [connection, provider, programID, program] = useWorkspace();
    const [poolPubkey, setPool] = useState();

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
          console.log(program.programId);
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
    
    return (
        <StyledWindow>
            <Button variant="contained" onClick={createLoan}>Fund a pool</Button>
        </StyledWindow>
    )
};
export default Apply;
  