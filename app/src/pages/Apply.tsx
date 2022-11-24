// @ts-nocheck
import Button from '@mui/material/Button';
import useWorkspace from './useWorkspace';
import { utils, web3, BN } from '@project-serum/anchor';
import { useState } from 'react';
import styled from 'styled-components';
import { TextField } from '@mui/material';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useEffect } from 'react';
import idl from "./../idl.json";
import useWallet from './useWallet';
import { Connection, PublicKey } from "@solana/web3.js";

const StyledWindow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Title = styled.h1`
  color: white;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextFieldStyled = styled(TextField)`
  margin-bottom: 25px !important;
`;

const { SystemProgram } = web3;
window.Buffer = Buffer;

export const POOL_PROGRAM = new web3.PublicKey(
  "HzGTJxHA4sZZGUU1V6ZaLtJwid9tiyKcapJzwP334js3"
);

const network = "http://127.0.0.1:8899";
const commitment = "processed";
const IDL = JSON.parse(JSON.stringify(idl)); // BUG with importing
const opts = { preflightCommitment: commitment };

const connection = new Connection(network, opts.preflightCommitment);
const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
const programID = new PublicKey(IDL.metadata.address);
const program = new Program(IDL, programID, provider);

const Apply = () => {
  const [connection, provider, programID, program] = useWorkspace();
  const [poolPubkey, setPool] = useState();
  const [walletAddress, checkIfWalletIsConnected, connectWallet] = useWallet();
  const [value, setValue] = useState('');
  const [rate, setRate] = useState('');

  fetch('https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=SOL')
    .then((response) => response.json())
    .then((data) => setRate(data.SOL));

  /* const createLoan= async () => {
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
  } */

  const handleChange=(event)=> {
    const regx = /^[0-9\b]+$/;
      if (event.target.value === '' || regx.test(event.target.value)) {
        setValue(event.target.value);
      }
  }

  const withdrawFromPool = async () => {
    try {
      /* const pool = await findPool(); */
      await program.rpc.withdrawFunds(new BN(value * rate * web3.LAMPORTS_PER_SOL), {
        accounts: {
          pool: POOL_PROGRAM,
          user: provider.wallet.publicKey,
        },
      });
      alert(`Got a loan of ${value * rate} SOL (${value} USD):`, POOL_PROGRAM.toString());
    } catch (error) {
      alert("error getting a loan:", error);
    }
  }
  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener("load", onLoad);
  }, []);
    
    return (
      <StyledWindow>
          {walletAddress ? 
            <Container>
              <Title>Here is where you take out a loan</Title>
              <TextFieldStyled 
                id="filled-basic" 
                label="How much do you want to take out for a loan? (USD)" 
                variant="filled"
                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
                value={value}
                onChange={handleChange}
                helperText={`${value} USD equals to ${value * rate} SOL`}
              />
              <Button variant="contained" onClick={withdrawFromPool}>Get a loan</Button>
            </Container>
            : <Button variant="contained" onClick={connectWallet}>Connect to Wallet</Button>}
        </StyledWindow>
    )
};
export default Apply;
  