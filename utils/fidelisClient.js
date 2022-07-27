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
let reserve_address = process.env.TOKEN_RESERVE_ADDRESS;
let pool_address = process.env.ADMIN_ADDRESS;

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



class FidelisContracts
{
    constructor()
    {
        this.contract_id = null;
    }

    /**
     * 
     * @param {*} contract_id 
     */
    setContractId(contract_id)
    {
        this.contract_id = contract_id;
    }

    async registerAgent(txn_inputs)
    {
        let response_obj = {
            'success': false
        };

        let response = await this.deploy(txn_inputs);
        this.contract_id = response.contract_id ?? null;

        if(!this.contract_id)
        {
            return response;
        }
        try{
            let op = "register_agent";

            let accounts = [sender, txn_inputs.agent_address];
            let args = [];
            args.push(new Uint8Array(Buffer.from(op)));
            let params = await algodClient.getTransactionParams().do();

            console.log("Registering Agent. . . . ");
            let  txn = algosdk.makeApplicationOptInTxn(sender, params, this.contract_id, args, accounts);

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
            console.log("Registered agent for app-id: ", this.contract_id);
    
            response_obj['success'] = true;
            response_obj['contract_id'] = this.contract_id;
            response_obj['description'] = 'Successfully registered agent';
    
            } 
            
            catch (err) {
                // If network request, display verbose error
                if (err.response) {
    
                    response_obj['message'] = err.response.text;
                    response_obj['status'] = err.response.status
                    response_obj['description']= 'Network request unsuccessful';
                    
                }
    
                else
                {
                    //TODO: Handle errors unrelated to network
                    response_obj['description']= 'Could not register agent';
                    console.log(err);
    
                }
            }

            return response_obj;
        
    }


    /**
     * 
     * @param {*} txn_inputs 
     * @returns 
     */
    async initiate (txn_inputs){

        let response_obj = {
            'success': false
        };

        let response = await this.registerAgent(txn_inputs);

        if(!response.success)
        {
            response_obj['message'] = "Agent needs to be successfully registered first";
            return response;
        }

        try
        {
            let op = "apply";
            let assets = [process.env.USDCA_TOKEN_RESERVE_ASSETID, process.env.TRUST_TOKEN_RESERVE_ASSETID, process.env.BACKER_TOKEN_RESERVE_ASSETID];
            let args = [];
            let accounts = [];
            accounts.push(txn_inputs.receiver_address);
            accounts.push(txn_inputs.agent_address);
            //accounts.push(pool_address);
            accounts.push(reserve_address);
            args.push(new Uint8Array(Buffer.from(op)));
            let params = await algodClient.getTransactionParams().do();

            console.log("Applying for loan. . . . ");

            for (let i = 0; i < txn_inputs.backers.length; i++)
            {
                //accounts.push(txn_inputs.backers[i].address);
            }
    
            let txn1 = algosdk.makeApplicationNoOpTxn(sender, params, this.contract_id, args, accounts,[], [20]);

            //First transaction beneficiary
            //Backers

            let txId = txn1.txID().toString();
    
            // Sign the transaction
            let sk = new Uint8Array(process.env.TOKEN_RESERVE_SK.split(","));
            let signedTxn1 = txn1.signTxn(sk);
            console.log("Signed transaction with txID: %s", txId);
    
            // Submit the transaction
            await algodClient.sendRawTransaction([signedTxn1]).do();
    
            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txId, 2);
    
            // print the app-id
            let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
            let appId = transactionResponse['application-index'];
            console.log("modified app with app-id: ",appId);
    
            response_obj['success'] = true;
            response_obj['contract_id'] = appId;
            response_obj['description'] = 'Successfully applied for loan';

        }

        catch(err)
        {
            // If network request, display verbose error
            if (err.response) {

                response_obj['message'] = err.response.text;
                response_obj['status'] = err.response.status
                response_obj['description']= 'Network request unsuccessful';
                
            }

            else
            {
                //TODO: Handle errors unrelated to network
                response_obj['description']= 'Could not apply for loan';
                console.log(err);

            }
        }

        return response_obj;
        
    }

    async invest (txn_inputs)
    {
        let response_obj = {
            'success': false
        };


        if(!this.contract_id)
        {
            response_obj['message'] = "No contract selected";
            return response_obj;
        }
    }


    async deploy (txn_inputs) {
 
        let response_obj = {
            'success': false
        };
        try {
            const localInts = 0
            const localBytes = 0
            const globalInts = 0
            const globalBytes = 12
    
            let op = "apply";
            let start_date = txn_inputs.start_date;
            let end_date = txn_inputs.end_date;
            let loan_amount = txn_inputs.loan_amount;
            let interest = txn_inputs.interest_rate;

            console.log('token', process.env.USDCA_TOKEN_RESERVE_ASSETID);

            let args = [];
            let assets = [200];
            
            args.push(new Uint8Array(Buffer.from(op)));
            args.push(new Uint8Array(Buffer.from(loan_amount)));
            args.push(new Uint8Array(Buffer.from(interest)));
            args.push(new Uint8Array(Buffer.from(start_date)));
            args.push(new Uint8Array(Buffer.from(end_date)));
            args.push(new Uint8Array(Buffer.from(reserve_address)));
            args.push(new Uint8Array(Buffer.from(pool_address)));
            args.push(new Uint8Array(Buffer.from(txn_inputs.receiver_address)));
            args.push(new Uint8Array(Buffer.from(txn_inputs.agent_address)));
            
            let accounts = [reserve_address, pool_address];
    
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
                localInts, localBytes, globalInts, globalBytes, args, accounts, [], assets);
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
            console.log("Created new app with app-id: ",appId);
    
            response_obj['success'] = true;
            response_obj['contract_id'] = appId;
            response_obj['description'] = 'Successfully deployed contract';
    
            } catch (err) {
                // If network request, display verbose error
                if (err.response) {
    
                    response_obj['message'] = err.response.text;
                    response_obj['status'] = err.response.status
                    response_obj['description']= 'Network request unsuccessful';
                    
                }
    
                else
                {
                    //TODO: Handle errors unrelated to network
                    response_obj['description']= 'Could not deploy contract';
                    console.log(err);
    
                }
            }
    
            return response_obj;
    }

}


let params = {
    "receiver_address": "4LA4LGD2IY4KJPLPK4W4L5VJZCSIAHWVGVFHQ7MQHVY7PPVHFAU3UM3YYY",
    "receiver_staked_points": "25",
    "loan_amount": "50",
    "interest_rate": "1",
    "agent_address": "IQDPRKBXGWTC3UQ25JJOBQVGKQSV3B55XR4YSZV6TPYE5V3XI3S7ZRECHM",
    "start_date": "123434532",
    "end_date": "32342342",
    "backers": [
        {
        "points": 2.5,
        "address": "V6PZQZ3DPRALNRK6EPPNFRK2NF5DI3VNZBX4C5VEQDCYORSJTK2PYHWQVQ",
        "earned": 2.5
        },

        {
        "points": 2.5,
        "address": "6MYSPXEKKMAW4SMTCNXPF3QDTWQBY2Z4YTFXUUYWSLR2EOJHV66XNXLY5E",
        "earned": 2.5
        }
    ]
}

let fidelisContracts = new FidelisContracts();

fidelisContracts.deploy(params).then((data)=>{
    console.log(data);
})



