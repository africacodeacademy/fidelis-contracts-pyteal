import dotenv from "dotenv";
import algosdk from "algosdk";
import {
    open, readFile
  } from 'node:fs/promises';
dotenv.config();

const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
const port = '';
const token = {
    'X-API-Key': process.env.API_KEY
}

const algodClient = new algosdk.Algodv2(token, baseServer, port); 

let myaccount = algosdk.mnemonicToSecretKey(process.env.ACCOUNT_MNEMONIC);
let sender = myaccount.addr;


async function compileProgram(client, TealSource) {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(TealSource);
    let compileResponse = await client.compile(programBytes).do();
    let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
    return compiledBytes;
}


expoerts.initialize = async () => {
    try {
        const localInts = 0
        const localBytes = 0
        const globalInts = 0
        const globalBytes = 12

        
        let start_date = "123434532";
        let end_date = "32342342";
        let loan_amount = 50;
        let interest = 1
        let appArgs1 = [];
        let appArgs2 = [];
        let appArgs3 = [];
        let appArgs4 = [];

        appArgs1.push(new Uint8Array(Buffer.from(loan_amount)));
        appArgs2.push(new Uint8Array(Buffer.from(interest)));
        appArgs3.push(new Uint8Array(Buffer.from(start_date)));
        appArgs4.push(new Uint8Array(Buffer.from(end_date)));

        let args = [];
        args.push(appArgs1, appArgs2, appArgs3, appArgs4);
        let accounts = ["XWR4JW3C4P5O4XSWTQTWG5LQHLYW66QKH3K2LWYEFQLCUHWGIGLVZUU6H4", "7C5J5IK273NQ5R2LCHWIITBH7N6DLBG2WA4I3EPCDJ3LU72PIJXJHGQCX4"];

        let approvalProgramfile = await open(process.env.APPROVAL_TEAL_SOURCE);
        let clearProgramfile = await open(process.env.CLEAR_TEAL_SOURCE);

        const approvalProgram = await approvalProgramfile.readFile();
        const clearProgram = await clearProgramfile.readFile();

        const approvalProgramBinary = await compileProgram(algodClient, approvalProgram);
        const clearProgramBinary = await compileProgram(algodClient, clearProgram);

        let params = await algodClient.getTransactionParams().do();
        
        const onComplete = algosdk.OnApplicationComplete.NoOpOC;

        console.log("Deploying Application. . . . ");

        let txn = algosdk.makeApplicationCreateTxn(sender, params, onComplete, 
            approvalProgramBinary, clearProgramBinary, 
            localInts, localBytes, globalInts, globalBytes, args, accounts);
        let txId = txn.txID().toString();

        // Sign the transaction
        let signedTxn = txn.signTxn(myaccount.sk);
        console.log("Signed transaction with txID: %s", txId);

        // Submit the transaction
        await algodClient.sendRawTransaction(signedTxn).do();

        // Wait for confirmation
        await algosdk.waitForConfirmation(algodClient, txId, 2);

        // print the app-id
        let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
        let appId = transactionResponse['application-index'];
        console.log("Created new with app-id: ",appId);
} catch (err) {
    console.error("Failed to deploy!", err);
    process.exit(1);
  }
}

initialize();