const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transactions{
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
		this.timestamp = Date.now();
	}

	calculatehash(){
		/*
 			calculates the hash of the transaction
		*/
		return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
	}

	signTransaction(signingKey){
	/*
	signs the transaction / checks the public key of fromaddress
	*/	
		if (signingKey.getPublic('hex') !== this.fromAddress) {
      		throw new Error('You cannot sign transactions for other wallets!');
      	}
      	const hashTx = this.calculatehash();
    	const sig = signingKey.sign(hashTx, 'base64');
		
		this.signature = sig.toDER('hex');
	}

	isValid(){
		/*
			checks if the transaction is valid
		*/
		if (this.fromAddress === null) return true;

	    if (!this.signature || this.signature.length === 0) {
	      throw new Error('No signature in this transaction');
	    }

	    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
	    return publicKey.verify(this.calculatehash(), this.signature);
	}


}

class Block{
	constructor(timestamp, transactions, previousHash = ""){
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.calculatehash();
		this.nonce = 0;
	}

	calculatehash(){
		/* 
			calculates the hash of the block
		*/
		return SHA256(this.timestamp + this.previousHash + this.nonce + JSON.stringify(this.transactions)).toString();
	}
	mineBlock(difficulty){
		/* 
			sets the difficulty of the miner for adding the block
		*/
		while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0") ){
			this.nonce += 1;
			this.hash = this.calculatehash();
		}

		console.log("Block mined: "+ this.hash);
	}
	hasValidTransactions() {
		/*
			checks if the call the transaction in the block are valid
		*/
    	for (const tx of this.transactions) {
      		if (!tx.isValid()) {
        		return false;
      		}
    	}
    	return true;
    }
}

class BlockChain{
	constructor(){
		this.chain = [this.createGeneisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	createGeneisBlock(){
		/*
			adds the geneis block into the chain
		*/
		return new Block(Date.parse('1999-21-04'), "Geneis Block", "0")
	}

	getLatestBlock(){
		/*
			returns latest block
		*/
		return this.chain[this.chain.length-1];
	}

	minePendingTransactions(miningRewardAddress){
		/*
			processes the pending transactions
		*/
		const rewardTx = new Transactions(null, miningRewardAddress, this.miningReward);
    	this.pendingTransactions.push(rewardTx);

		let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
		block.mineBlock(this.difficulty);

		console.log("block Successfully mined");
		this.chain.push(block);

		// this.pendingTransactions = [new Transactions(null, miningRewardAddress, this.miningReward)];
		this.pendingTransactions = [];
	}	

	addTransaction(transaction){
		/*
			add new transaction
		*/
		// console.log(transaction.fromAddress, transaction.toAddress);
		if (!transaction.fromAddress || !transaction.toAddress) {
	      throw new Error('Transaction must include from and to address');
	    }

	    if (!transaction.isValid()) {
	      throw new Error('Cannot add invalid transaction to chain');
	    }
	    
	    if (transaction.amount <= 0) {
	      throw new Error('Transaction amount should be higher than 0');
	    }
	    

	    if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
	      throw new Error('Not enough balance');
	    }
	
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress(address){
		/*
			gets the balance of the wallet
		*/
		let balance = 0;

		for(const block of this.chain){
			for(const trans of block.transactions){
				if(trans.formAddress === address){
					balance-=trans.amount;
				}
				if(trans.toAddress === address){
					balance+=trans.amount;
				}
			}
		}

		return balance;
	}

	getAllTransactionsForWallet(address) {
		/*
			returns all transactions
		*/
    const txs = [];

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }

    // debug('get transactions for wallet count: %s', txs.length);
    console.log('get transactions for wallet count:', txs.length);
    return txs;
  }

	isChainValid(){
		/*
			checks the chain is valid
			testing
		*/
		for(let i =1;i<this.chain.length-1 ;i++){
			const currBlock = this.chain[i];
			const prevBlock = this.chain[i-1];

			if(!currBlock.hasValidTransactions()){
				console.log("1");
				return false;
			}

			if(currBlock.hash !== currBlock.calculatehash()){
				console.log("2");
				return false;
			}

			if(currBlock.previousHash !== prevBlock.hash){ // to be tested
				console.log("3");
				console.log(chain);
				return false;
			}

		}
		console.log("true");
		return true;
	}
}

class Wallet{
	constructor(privateKey, publicKey, balance){
		this.key = ec.genKeyPair();
		this.accBalance = balance;
		this.publicKey = key.getPublic('hex');
		this.privateKey = key.getPrivate('hex');
		this.transaction = [getAllTransactionsForWallet(this.publicKey)];
	}

	getBalance(){
		return accBalance;
	}

}


module.exports.Wallet = Wallet;
module.exports.BlockChain = BlockChain;
module.exports.Block = Block;
module.exports.Transactions = Transactions;