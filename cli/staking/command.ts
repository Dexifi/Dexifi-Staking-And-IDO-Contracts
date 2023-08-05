import {program} from 'commander';
import {
    PublicKey
} from '@solana/web3.js';
import { getGlobalInfo, getUnstakableInfo, getUserInfo, initProject, initializeUserPool, setClusterConfig, stakeDxe, unstakeDxe, withdraw } from './scripts';

program.version('0.0.1');

programCommand('status')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
.action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);
    
    console.log(await getGlobalInfo());
});

programCommand('user-status')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-a, --address <string>', 'user pubkey')
.action(async (directory, cmd) => {
    const { env, keypair, rpc, address } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    if (address === undefined) {
      console.log("Error User Address input");
      return;
    }
    console.log(await getUserInfo(new PublicKey(address)));
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

programCommand('init-user')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    
    await setClusterConfig(env, keypair, rpc);

    await initializeUserPool();
});

programCommand('stake')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-a, --amount <number>')
.option('-l, --locker <number>')
.action(async (directory, cmd) => {
    const { env, keypair, rpc, amount, locker } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);
    if (amount === undefined || isNaN(parseFloat(amount))) {
        console.log("Error token amount Input");
        return;
    }
    if (locker === undefined || isNaN(parseInt(locker))) {
        console.log("Error token amount Input");
        return;
    }

    await stakeDxe(parseFloat(amount), parseInt(locker));
});

programCommand('unstakable')
.option('-a, --address <string>', 'user pubkey')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.action(async (directory, cmd) => {
    const { env, keypair, rpc, address } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);
    await setClusterConfig(env, keypair, rpc);

    if (address === undefined) {
      console.log("Error User Address input");
      return;
    }

    console.log(await getUnstakableInfo(new PublicKey(address)));
});

programCommand('unstake')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-l, --locker <number>')
.action(async (directory, cmd) => {
    const { env, keypair, rpc, locker } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);
    if (locker === undefined || isNaN(parseInt(locker))) {
        console.log("Error token amount Input");
        return;
    }

    await unstakeDxe(parseInt(locker));
});

programCommand('withdraw')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
.option('-a, --amount <number>')
.action(async (directory, cmd) => {
    const { env, keypair, rpc, amount } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);
    if (amount === undefined || isNaN(parseFloat(amount))) {
        console.log("Error token amount Input");
        return;
    }

    await withdraw(parseFloat(amount));
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
yarn staking init-user
yarn staking stake -a 300 -l 0
yarn staking unstakable -a G2sc5mU3eLRkbRupnupzB3NTzZ85bnc9L1ReAre9dzFU
yarn staking unstakable -a 4EjZ4sGnvfLbW89AAzSehob7Rmkym7vCH3SMcThSx9q1
*/
