// @ts-nocheck
import Button from '@mui/material/Button';
import useWorkspace from './useWorkspace';
import { utils, web3, BN } from '@project-serum/anchor';
import { useState } from 'react';
import styled from 'styled-components';
import usePool from './usePool';
import { Alert, TextField } from '@mui/material';
import idl from "./../idl.json";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useEffect } from 'react';
import useWallet from './useWallet';

const { SystemProgram } = web3;
window.Buffer = Buffer;

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

const Invest = () => {
    /* const [connection, programID, program, provider] = useWorkspace(); BUG */
    const [findPool, pool_program] = usePool();
    const [walletAddress, checkIfWalletIsConnected, connectWallet] = useWallet();
    const [value, setValue] = useState('');
    const [rate, setRate] = useState('');
    console.log(provider);

    fetch('https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=SOL')
    .then((response) => response.json())
    .then((data) => setRate(data.SOL));

    const fundPool = async () => {
      try {
        await program.rpc.fundPool(new BN(value * rate * web3.LAMPORTS_PER_SOL), {
          accounts: {
            pool: POOL_PROGRAM,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        });
        {/* <Alert severity="success">{`Donated ${value * rate} to: pool_program.toString()`}</Alert> */}
        alert(`Invested ${value * rate} SOL (${value} USD) to:`, POOL_PROGRAM.toString());
      } catch (error) {
        alert(`Error donating:`, error);
        {/* <Alert variant='filled' severity="error">{`Error donating: ${error}`}</Alert> */}
      }
    };

    const handleChange=(event)=> {
      const regx = /^[0-9\b]+$/;
        if (event.target.value === '' || regx.test(event.target.value)) {
          setValue(event.target.value);
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
              <Title>Here is where you invest</Title>
              <TextFieldStyled 
                id="filled-basic" 
                label="How much do you want to put in the fund? (USD)" 
                variant="filled"
                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
                value={value}
                onChange={handleChange}
                helperText={`${value} USD equals to ${value * rate} SOL`}
              />
              <Button variant="contained" onClick={fundPool}>Fund a pool</Button>
              {/* <Button variant="outlined" onClick={withdrawFromPool}>Withdraw from a pool</Button> */}
            </Container>
            : <Button variant="contained" onClick={connectWallet}>Connect to Wallet</Button>}
        </StyledWindow>
    )
};
export default Invest;
  