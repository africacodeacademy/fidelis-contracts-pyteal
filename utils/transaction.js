/**
 *  TODO:
 * 
 * - create loan 
 */
 const algosdk = require('algosdk');
 const Wallet = require('../models/Wallet');


/**
 * transferTokens
 * 
 * 
 * @param {String} receiver_address Account address
 * @param {String} sender_address Account address
 * @param {String} sender_sk Private / Secrete key
 * @param {String} receiver_sk Private / Secrete key
 * @param {Number} amount 
 * @param {Number} tokenAssetId Asset Indentifier
 * @param {String} note Transaction message or reference string
 * @returns 
 */
exports.transferTokens = async(receiver_address, sender_address, sender_sk, receiver_sk, amount=25, tokenAssetId, note="Fidelis tokens transfer" ) => {

    try {  
        
        const algod_server = process.env.ALGODSERVER;
        const algod_port = process.env.ALGODPORT;
        const algod_token = process.env.ALGOD_TOKEN;

        let algod_client = new algosdk.Algodv2(algod_token, algod_server, algod_port);
        let client_status = await algod_client.status().do()

        const feePerByte = 1000;
        var genesisHash = process.env.GENESIS_HASH;
        

        const enc = new TextEncoder();
    
        const assetIndex = tokenAssetId; // identifying index of the asset
    
        // set suggested parameters
        // in most cases, we suggest fetching recommended transaction parameters
        var suggestedParams = await algod_client.getTransactionParams().do();

        let optinTxn_sender = receiver_address
        let optinTxn_recipient = optinTxn_sender;
        let closeRemainderTo = undefined
        let revocationTarget = undefined
        let optin_amount = 0;

        let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        optinTxn_sender, 
        optinTxn_recipient, 
        closeRemainderTo, 
        revocationTarget,
        optin_amount, 
        enc.encode("optin txn"), 
        assetIndex, 
        suggestedParams);

        rawSignedTxn = opttxn.signTxn(receiver_sk)
        let ctx = (await algod_client.sendRawTransaction(rawSignedTxn).do());
        
        let confirmedTxn = await algosdk.waitForConfirmation(algod_client, ctx.txId, 4);

        suggestedParams.fee = feePerByte
        suggestedParams.flatFee = true
        suggestedParams.firstRound = client_status["last-round"]
        suggestedParams.lastRound = client_status["next-version-round"]+6
        suggestedParams.genesisHash = genesisHash
      
        
        
        // create the asset transfer transaction
        const transactionOptions = {
        from: sender_address,
        to: receiver_address,
        // closeRemainderTo: closeAssetsToAddr,
        note: enc.encode(note),
        amount,
        assetIndex,
        suggestedParams,
        };
    
        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
        transactionOptions
        );
    
        // sign the transaction
        const signedTxn = txn.signTxn(sender_sk);
            

        let tx = (await algod_client.sendRawTransaction(signedTxn).do());

        const ptx = await algosdk.waitForConfirmation(algod_client, tx.txId, 6);
        

        console.log("Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"]);
        return ptx;

    }
    catch (err) {
        console.log("err", err);
        return Promise.reject(err)
    }
}

/**
 * seedAccWithAlgos
 * 
 * @param {String} receiver_address Account address
 * @returns 
 */
exports.seedAccWithAlgos = async (receiver_address) => {
    const algod_server = process.env.ALGODSERVER;
    const algod_port = process.env.ALGODPORT;
    const algod_token = process.env.ALGOD_TOKEN;

    let algod_client = new algosdk.Algodv2(algod_token, algod_server, algod_port);

    let params = await algod_client.getTransactionParams().do();
    const enc = new TextEncoder();
    note = enc.encode("seed account with 1 ALGO");
    let amount = 1000000; // equals 1 ALGO

    let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: process.env.TOKEN_RESERVE_ADDRESS, 
        to: receiver_address, 
        amount: amount, 
        note: note, 
        suggestedParams: params
    });

    // Sign the transaction
    let signedTxn = txn.signTxn(new Uint8Array(
                                        process.env.TOKEN_RESERVE_SK.split(',')
                                    )
                                );
    let txId = txn.txID().toString();
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await algod_client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    let confirmedTxn = await algosdk.waitForConfirmation(algod_client, txId, 10);

    //Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    return  confirmedTxn
}


/**
 * Create loan
 * 
 * Grouped transaction with escrow account
 * 
 * create escrow account to hold tokens
 * 30day time limit to find enough backers, after 30days staked points revert back to owners
 * (not sure how any rounds that amounts to)
 *  
 */

exports.createLoan = async () => {
    
}


/**
 * getWalletTransactions
 * 
 * @param {String} address Account address
 * @returns 
 */
exports.getWalletTransactions = async (address) => {

    try{
        //Connect to algo client
        const algod_server = process.env.ALGODSERVER;
        const indexer_port = process.env.INDEXERPORT;
        const algod_token = process.env.ALGOD_TOKEN

        let indexer = new algosdk.Indexer(algod_token, algod_server, indexer_port)
        let transactions = await indexer.lookupAccountTransactions(address).do()

        return transactions
    }
    catch(err){
        console.log(err)
        return Promise.reject(err)
    }
     
}