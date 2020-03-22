const { BlockChain, Transactions } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const myKey = ec.keyFromPrivate('c554c2d8ecb575c735361c6b5f1ce4c17a5d9c24f30b1e77eec93e642ababbf3');
const myWalletAddress = myKey.getPublic('hex');
// console.log(myKey, myWalletAddress);

const pranitCoin = new BlockChain();


console.log();
console.log(`Balance of Pranit Nigde is ${pranitCoin.getBalanceOfAddress(myWalletAddress)}`);

const tx1 = new Transactions(myWalletAddress, 'address21', 10);
tx1.signTransaction(myKey);
pranitCoin.addTransaction(tx1);
console.log('starting miner....');
pranitCoin.minePendingTransactions(myWalletAddress);
   
const tx2 = new Transactions(myWalletAddress, 'address1', 10);
tx2.signTransaction(myKey);
pranitCoin.addTransaction(tx2);
pranitCoin.minePendingTransactions(myWalletAddress);

console.log();
console.log(`Balance of Pranit Nigde is ${pranitCoin.getBalanceOfAddress(myWalletAddress)}`);

console.log();
console.log('Blockchain valid?', pranitCoin.isChainValid() ? 'Yes' : 'No');