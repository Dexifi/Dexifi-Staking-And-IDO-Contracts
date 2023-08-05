import {program} from 'commander';
import {
    PublicKey
} from '@solana/web3.js';
import { buyTicket, claimToken, claimUsdc, initProject, initUser, initializeLotteryPool, printGlobalInfo, printLotteryInfo, printUserInfo, setClusterConfig, setWinner, withdrawUsdc } from './scripts';

program.version('0.0.1');

programCommand('status')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
.action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);
    
    console.log(await printGlobalInfo());
});

programCommand('lottery-status')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-l, --lottery <string>', 'lottery address')
.action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
      console.log("Error Lottery Address input");
      return;
    }
    console.log(await printLotteryInfo(new PublicKey(lottery)));
});

programCommand('user-status')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-l, --lottery <string>', 'lottery address')
.option('-a, --address <string>', 'user address')
.action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery, address } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error Lottery Address input");
        return;
    }

    if (address === undefined) {
      console.log("Error User Address input");
      return;
    }
    console.log(await printUserInfo(new PublicKey(lottery), new PublicKey(address)));
});

programCommand('init')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.action(async (directory, cmd) =>
{
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    await initProject();
});

programCommand('init-lottery')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-t, --token <string>', 'token mint address')
.option('-a, --amount <number>', 'total raise amount')
.option('-w, --winner <number>', 'winner amount')
.option('-p, --price <number>', 'ticket price')
.action(async (directory, cmd) =>
{
    const { env, keypair, rpc, token, amount, winner, price } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    if (token === undefined) {
      console.log("Error User Address input");
      return;
    }
    if (amount === undefined || isNaN(parseInt(amount))) {
        console.log("Error token amount Input");
        return;
    }
    if (winner === undefined || isNaN(parseInt(winner))) {
        console.log("Error winner count Input");
        return;
    }
    if (price === undefined || isNaN(parseInt(price))) {
        console.log("Error ticket price Input");
        return;
    }

    const now = new Date();
    const open = new Date(now.getTime() + 180000);  // 3 min after
    const close = new Date(now.getTime() + 360000); // 6 min after
    const launch = new Date(now.getTime() + 540000); // 9 min after
    await initializeLotteryPool(
        new PublicKey(token), 
        open.getTime() / 1000,
        close.getTime() / 1000,
        launch.getTime() / 1000,
        amount, 
        winner, 
        price);
});

programCommand('init-user')
.option('-l, --lottery <string>', 'lottery address')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery, amount } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error Lottery Address input");
        return;
    }

    await initUser(new PublicKey(lottery));
});

programCommand('buy-ticket')
.option('-l, --lottery <string>', 'lottery address')
.option('-t, --token <string>', 'token mint address')
.option('-a, --amount <number>', 'ticket amount')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery, token, amount } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error Lottery Address input");
        return;
    }
    if (token === undefined) {
        console.log("Error Lottery Address input");
        return;
    }
    if (amount === undefined || isNaN(parseInt(amount))) {
        console.log("Error ticket amount Input");
        return;
    }

    await buyTicket(new PublicKey(lottery), new PublicKey(token), amount);
});

programCommand('set-winner')
.option('-l, --lottery <string>', 'lottery address')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error Lottery Address input");
        return;
    }

    await setWinner(new PublicKey(lottery));
});

programCommand('claim-usdc')
.option('-l, --lottery <string>', 'lottery address')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error Lottery Address input");
        return;
    }

    await claimUsdc(new PublicKey(lottery));
});

programCommand('claim-token')
.option('-l, --lottery <string>', 'lottery address')
.option('-t, --token <string>', 'token mint address')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery, token } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error lottery address input");
        return;
    }
    if (token === undefined) {
        console.log("Error Token mint address input");
        return;
    }

    await claimToken(new PublicKey(lottery), new PublicKey(token));
});

programCommand('withdraw-usdc')
.option('-l, --lottery <string>', 'lottery address')
.option('-a, --amount <number>', 'ticket amount')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, lottery, amount } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    if (lottery === undefined) {
        console.log("Error Lottery Address input");
        return;
    }
    if (amount === undefined || isNaN(parseInt(amount))) {
        console.log("Error ticket amount Input");
        return;
    }

    await withdrawUsdc(new PublicKey(lottery), amount);
});

function programCommand(name: string) {
    return program
        .command(name)
        .option('-e, --env <string>', 'Solana cluster env name', 'devnet') //mainnet-beta, testnet, devnet
        .option('-r, --rpc <string>', 'Solana cluster RPC name', 'https://api.devnet.solana.com')
        .option('-k, --keypair <string>', 'Solana wallet Keypair Path', '../yeni.json')
}

program.parse(process.argv);

/*
yarn lottery init
yarn lottery init-lottery -t 5CY4inXAWEKDENqJ5ZLNaTYX8gzjHZNXimuj7VmFmVi6 -a 100000 -w 10 0 -p 8
yarn lottery lottery-status -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF

yarn lottery init-user -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF
yarn lottery buy-ticket -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF -t 5CY4inXAWEKDENqJ5ZLNaTYX8gzjHZNXimuj7VmFmVi6 -a 5
yarn lottery user-status -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF -a G2sc5mU3eLRkbRupnupzB3NTzZ85bnc9L1ReAre9dzFU

yarn lottery set-winner -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF

yarn lottery claim-usdc -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF
yarn lottery claim-token -l J6aer9z2w6HVSUBdHK9jJsTksmVjhtBwdESGiukDpVwF -t 5CY4inXAWEKDENqJ5ZLNaTYX8gzjHZNXimuj7VmFmVi6
*/