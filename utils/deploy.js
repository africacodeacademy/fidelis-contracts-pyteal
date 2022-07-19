const algosdk = require("algosdk");
const fs = require('fs/promises');
const dotenv = require("dotenv");


dotenv.config({
    path: ".env",
  });

const baseServer = process.env.ALGODSERVER;
const port = process.env.ALGODPORT;
let algod_token = process.env.ALGOD_TOKEN
let headers = { "x-api-key": algod_token };

const algodClient = new algosdk.Algodv2(algod_token, baseServer, port, headers); 

//let myaccount = algosdk.mnemonicToSecretKey(process.env.ACCOUNT_MNEMONIC);
//let sender = myaccount.addr;
let sender = process.env.TOKEN_RESERVE_ADDRESS;



async function compileProgram(client, TealSource) {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(TealSource);
    let compileResponse = await client.compile(programBytes).do();
    let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
    return compiledBytes;
}


exports.initialize = async () => {
 
    let response_obj = [{
        'success': false
    }];
    try {
        const localInts = 0
        const localBytes = 0
        const globalInts = 0
        const globalBytes = 12

        let op = "apply";
        let start_date = "123434532";
        let end_date = "32342342";
        let loan_amount = "50";
        let interest = "1"
        let args = []
        
        args.push(new Uint8Array(Buffer.from(op)));
        args.push(new Uint8Array(Buffer.from(loan_amount)));
        args.push(new Uint8Array(Buffer.from(interest)));
        args.push(new Uint8Array(Buffer.from(start_date)));
        args.push(new Uint8Array(Buffer.from(end_date)));
        
        let accounts = ["XWR4JW3C4P5O4XSWTQTWG5LQHLYW66QKH3K2LWYEFQLCUHWGIGLVZUU6H4", "7C5J5IK273NQ5R2LCHWIITBH7N6DLBG2WA4I3EPCDJ3LU72PIJXJHGQCX4"];

        //let approvalProgramfile = await open(process.env.APPROVAL_TEAL_SOURCE);
        //let clearProgramfile = await open(process.env.CLEAR_TEAL_SOURCE);

        const approvalProgram = await fs.readFile(process.env.APPROVAL_TEAL_SOURCE, { encoding: 'utf8' });
        const clearProgram = await fs.readFile(process.env.CLEAR_TEAL_SOURCE)

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
        let sk = new Uint8Array(process.env.TOKEN_RESERVE_SK.split(","));
        let signedTxn = txn.signTxn(sk);
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
            // If network request, display verbose error
            if (err.response) {

                response_obj.push(
                    ...{
                        'message': err.response.text.message,
                        'status': err.response.status,
                         'description': 'Network request unsuccessful'
                    });

            }

            else
            {
                //TODO: Handle errors unrelated to network
                console.log(err);

            }
        }

        return response_obj;
}

exports.initialize().then((data)=>{
    console.log(data);
})