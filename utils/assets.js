const algosdk = require('algosdk');
/**
 * mint fidelis tokens
 */

/**
 * mintFidelisTrustTokens
 * 
 * @param {*} amount 
 * @param {*} note 
 * @returns 
 */
 exports.mintFidelisTrustTokens = async(amount=1000, note="Fidelis mint trust tokens" ) => {

    try {  
       
        const freezeAddr = process.env.ADMIN_ADDRESS; // account that can freeze other accounts for this asset
        const managerAddr = process.env.TOKEN_RESERVE_ADDRESS; // account able to update asset configuration
        const clawbackAddr = process.env.TOKEN_RESERVE_ADDRESS; // account allowed to take this asset from any other account
        const reserveAddr = process.env.TOKEN_RESERVE_ADDRESS; // account that holds reserves for this asset
      
        const algod_server = process.env.ALGODSERVER;
        const algod_port = process.env.ALGODPORT;
        const algod_token = process.env.ALGOD_TOKEN;

        let algod_client = new algosdk.Algodv2(algod_token, algod_server, algod_port);
        let client_status = await algod_client.status().do()

        const feePerByte = 1000;
        const firstValidRound = 7000;
        const lastValidRound = 8000;
        const genesisHash = process.env.GENESIS_HASH;
      
        const total = amount; // how many of this asset there will be
        const decimals = 2; // units of this asset are whole-integer amounts
        const assetName = 'Fidelis Trust';
        const unitName = 'FTT';
        const url = 'website';
        const metadata = new Uint8Array(
          Buffer.from(
            '664143504f346e52674f35356a316e64414b3357365367633441506b63794668',
            'hex'
          )
        ); // should be a 32-byte hash
        const defaultFrozen = false; // whether accounts should be frozen by default
      
        const enc = new TextEncoder();
        
        // create suggested parameters
        // in most cases, we suggest fetching recommended transaction parameters
        // using the `algosdk.Algodv2.getTransactionParams()` method
        const suggestedParams = {
          flatFee: false,
          fee: feePerByte,
          firstRound: client_status["last-round"],
          lastRound: client_status["next-version-round"]+2,
          genesisHash,
          note:enc.encode(note)
        };
      
        // initialize the asset creation transaction
        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          from:  process.env.TOKEN_RESERVE_ADDRESS ,
          total,
          decimals,
          assetName,
          unitName,
          assetURL: url,
          assetMetadataHash: metadata,
          defaultFrozen,
      
          freeze: freezeAddr,
          manager: managerAddr,
          clawback: clawbackAddr,
          reserve: reserveAddr,
      
          suggestedParams,
        });
      
        // sign the transaction

        
        let sk = new Uint8Array(
            process.env.TOKEN_RESERVE_SK.split(',')
          )

        const signedTxn = txn.signTxn(sk);
      
        // print transaction data
        // const decoded = algosdk.decodeSignedTransaction(signedTxn);
   

        

        let tx = (await algod_client.sendRawTransaction(signedTxn).do());

        const ptx = await algosdk.waitForConfirmation(algod_client, tx.txId, 4);
        

        console.log("Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"]);
        return ptx;

    }
    catch (err) {
        return Promise.reject(err)
    }
}

/**
 * mintFidelisBackerTokens
 * 
 * @param {*} amount 
 * @param {*} note 
 * @returns 
 */
exports.mintFidelisBackerTokens = async(amount=1000, note="Fidelis mint backer tokens" ) => {

    try {  
       
        const freezeAddr = process.env.ADMIN_ADDRESS; // account that can freeze other accounts for this asset
        const managerAddr = process.env.TOKEN_RESERVE_ADDRESS; // account able to update asset configuration
        const clawbackAddr = process.env.TOKEN_RESERVE_ADDRESS; // account allowed to take this asset from any other account
        const reserveAddr = process.env.TOKEN_RESERVE_ADDRESS; // account that holds reserves for this asset
      
        const algod_server = process.env.ALGODSERVER;
        const algod_port = process.env.ALGODPORT;
        const algod_token = process.env.ALGOD_TOKEN;

        let algod_client = new algosdk.Algodv2(algod_token, algod_server, algod_port);
        let client_status = await algod_client.status().do()

        const feePerByte = 1000;
        const genesisHash = process.env.GENESIS_HASH;
      
        const total = amount; // how many of this asset there will be
        const decimals = 2; // units of this asset are whole-integer amounts
        const assetName = 'Fidelis Backer';
        const unitName = 'FBT';
        const url = 'website';
        const metadata = new Uint8Array(
          Buffer.from(
            '664143504f346e52674f35356a316e64414b3357365367633441506b63794668',
            'hex'
          )
        ); // should be a 32-byte hash
        const defaultFrozen = false; // whether accounts should be frozen by default
      
        const enc = new TextEncoder();
        
        // create suggested parameters
        // in most cases, we suggest fetching recommended transaction parameters
        // using the `algosdk.Algodv2.getTransactionParams()` method
        const suggestedParams = {
          flatFee: false,
          fee: feePerByte,
          firstRound: client_status["last-round"],
          lastRound: client_status["next-version-round"]+2,
          genesisHash,
          note:enc.encode(note)
        };
      
        // initialize the asset creation transaction
        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          from:  process.env.TOKEN_RESERVE_ADDRESS ,
          total,
          decimals,
          assetName,
          unitName,
          assetURL: url,
          assetMetadataHash: metadata,
          defaultFrozen,
      
          freeze: freezeAddr,
          manager: managerAddr,
          clawback: clawbackAddr,
          reserve: reserveAddr,
      
          suggestedParams,
        });
      
        // sign the transaction

        
        let sk = new Uint8Array(
            process.env.TOKEN_RESERVE_SK.split(',')
          )

        const signedTxn = txn.signTxn(sk);
      
        // print transaction data
        // const decoded = algosdk.decodeSignedTransaction(signedTxn);
   

        

        let tx = (await algod_client.sendRawTransaction(signedTxn).do());

        const ptx = await algosdk.waitForConfirmation(algod_client, tx.txId, 4);
        

        console.log("Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"]);
        return ptx;

    }
    catch (err) {
        return Promise.reject(err)
    }
}
