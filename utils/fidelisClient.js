const algosdk = require("algosdk");
const fs = require("fs/promises");
const dotenv = require("dotenv");
const INVESTOR_TYPE = require("../constants/investorTypes");

const walletUtils = require("./wallet");
const transactionUtilities = require("./transaction");

dotenv.config({
  path: ".env",
});

const baseServer = process.env.ALGODSERVER;
const port = process.env.ALGODPORT;
let algod_token = process.env.ALGOD_TOKEN;
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
  let compiledBytes = new Uint8Array(
    Buffer.from(compileResponse.result, "base64")
  );
  return compiledBytes;
}

class FidelisContracts {
  constructor() {
    this.contract_id = null;
  }

  /**
   *
   * @param {*} contract_id
   */
  setContractId(contract_id) {
    this.contract_id = contract_id;
  }


  /**
   * 
   * @param {*} txn_inputs 
   * @param {*} contract_id supplied only when the contract is deployed
   * @returns 
   */
  async initiationFlow(txn_inputs, contract_id=null) {
    let response_obj = {
      success: false,
    };
    let backer_response = null;

    if(!contract_id)
    {
      let deploy_response = await this.deploy(txn_inputs);
      console.log(deploy_response);
      if (deploy_response.success) {
        this.contract_id = deploy_response.contract_id;
      } else {
        return deploy_response;
      }
    }
    else
    {
      this.contract_id = contract_id;
    }

    // Opt in escrow
    let escrow_response = await this.escrowOptIn(this.contract_id);
    if(!escrow_response.success)
    {
      return escrow_response;
    }

    // Beneficiary opt in
    let opt_in_acc = {
      address: txn_inputs.receiver_address,
      mnemonic: txn_inputs.receiver_mnemonic,
    };

    let opt_in_res = await this.optIn(opt_in_acc);
    console.log(opt_in_res);

    let beneficiary_response = await this.invest(txn_inputs, INVESTOR_TYPE.BENEFICIARY);
    console.log(beneficiary_response);
    if(!beneficiary_response.success)
    {
      return beneficiary_response;
    }

    // Backers 
    for (let i = 0; i < txn_inputs.backers.length; i++)
    {
      opt_in_acc['address'] = txn_inputs.backers[i].address;
      opt_in_acc['mnemonic'] = txn_inputs.backers[i].mnemonic;
      opt_in_res = await this.optIn(opt_in_acc);
      console.log(opt_in_res);

      backer_response = await this.invest(txn_inputs.backers[i], INVESTOR_TYPE.BACKER);
      console.log(backer_response);

    }

    return response_obj;
    }

    /**
     * 
     * @param {*} txn_inputs 
     * @param {*} investor_type 
     * @returns 
     */
    async invest (txn_inputs, investor_type, contract_id=null)
    {
        contract_id = contract_id == null ? this.contract_id : contract_id;
        let sender_addr = "";
        let sender_mnemonic = "";
        let sender_acc = null;
        let investor_desc = '';
        let response_obj = {
            'success': false
        };


        if(!contract_id)
        {
            response_obj['message'] = "No contract selected";
            return response_obj;
        }

        try {
            let op = "invest";
            let encryption_key = "tobemade";
            let assets = [];
            let args = [];

            args.push(new Uint8Array(Buffer.from(op)));

            switch (investor_type) 
            {
                case INVESTOR_TYPE.BENEFICIARY:
                    assets.push(parseInt(process.env.TRUST_TOKEN_RESERVE_ASSETID));
                    args.push(new Uint8Array(Buffer.from(txn_inputs.receiver_staked_points)));
                    sender_addr = txn_inputs.receiver_address;
                    sender_mnemonic = txn_inputs.receiver_mnemonic;
                    sender_acc = algosdk.mnemonicToSecretKey(sender_mnemonic);
                    investor_desc = 'beneficiary';
                    
                    break;

                case INVESTOR_TYPE.BACKER:
                    assets.push(parseInt(process.env.BACKER_TOKEN_RESERVE_ASSETID));
                    args.push(new Uint8Array(Buffer.from(txn_inputs.points)));
                    sender_addr = txn_inputs.address;
                    sender_mnemonic = txn_inputs.mnemonic;
                    sender_acc = algosdk.mnemonicToSecretKey(sender_mnemonic);
                    investor_desc = 'backer';

                    break;

            
                default:
                    response_obj['message'] = "Wrong investor type provided"
                    return response_obj;
            }
            args.push(new Uint8Array(Buffer.from(encryption_key)));
            let note = new Uint8Array(Buffer.from("Staking"));
            let rekeyTo = algosdk.getApplicationAddress(contract_id);

            let params = await algodClient.getTransactionParams().do();
    
            console.log(`Adding ${investor_desc} ...`);
    
            let  txn = algosdk.makeApplicationNoOpTxn(sender_addr, params, contract_id, args, [], [], assets, note, undefined, rekeyTo);

            let txId = txn.txID().toString();
    
            // Sign the transaction
            
            let sk = new Uint8Array(process.env.TOKEN_RESERVE_SK.split(","));
            let signedTxn = txn.signTxn(sender_acc.sk);
            console.log("Signed transaction with txID: %s", txId);
    
            // Submit the transaction
            await algodClient.sendRawTransaction(signedTxn).do();
    
            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txId, 2);
    
            // print the app-id
            let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
            let appId = transactionResponse['application-index'];
            console.log(`Added ${investor_desc} for app-id: `, contract_id);
    
            response_obj['success'] = true;
            response_obj['contract_id'] = contract_id;
            response_obj['description'] = `Successfully staked points for ${investor_desc} with address ${sender_addr}`;
    
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
                    response_obj['description']= `Could not staake points for ${investor_desc} with address ${sender_addr}`;
                    console.log(err);
    
                }
        }
        
        return response_obj;

  }


  /**
   * Opt in investor[either backer or beneficiary]
   * @param {*} txn_inputs 
   * @returns 
   */
  async optIn(txn_inputs) {
    this.contract_id = 102566748;
    let response_obj = {
      success: false,
    };
    let sender_addr = txn_inputs.address;
    let sender_mnemonic = txn_inputs.mnemonic;
    let sk = algosdk.mnemonicToSecretKey(sender_mnemonic).sk;

    try {
      let params = await algodClient.getTransactionParams().do();

      console.log(`Investor Opting in ...`);

      let txn = algosdk.makeApplicationOptInTxn(
        sender_addr,
        params,
        this.contract_id
      );

      let txId = txn.txID().toString();

      // Sign the transaction

      let signedTxn = txn.signTxn(sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await algodClient.sendRawTransaction(signedTxn).do();

      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 2);

      // print the app-id
      let transactionResponse = await algodClient
        .pendingTransactionInformation(txId)
        .do();
      let appId = transactionResponse["application-index"];
      console.log(`opted in`);

      response_obj["success"] = true;
      response_obj["contract_id"] = this.contract_id;
      response_obj["description"] = `Investor successfully opten in`;
    } catch (err) {
      // If network request, display verbose error
      if (err.response) {
        response_obj["message"] = err.response.text;
        response_obj["status"] = err.response.status;
        response_obj["description"] = "Network request unsuccessful";
      } else {
        //TODO: Handle errors unrelated to network
        response_obj["description"] = `Could not opt in`;
        console.log(err);
      }
    }

    return response_obj;
  }

  /**
   * 
   * @param {*} contract_id 
   * @returns 
   */
  async escrowOptIn(contract_id)
  {
      let response_obj = {
        'success': false
    };

    try {

      let op = "config";
      let args = [];
      let assets = [parseInt(process.env.USDCA_TOKEN_RESERVE_ASSETID), parseInt(process.env.TRUST_TOKEN_RESERVE_ASSETID), parseInt(process.env.BACKER_TOKEN_RESERVE_ASSETID)];
      args.push(new Uint8Array(Buffer.from(op)));

      
      let params = await algodClient.getTransactionParams().do();
    
      console.log(`Opting escrow into fidelis tokens ...`);

      let  txn = algosdk.makeApplicationNoOpTxn(sender, params, contract_id, args, [], [], assets);

      let txId = txn.txID().toString();

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
      //console.log(transactionResponse);
      response_obj['success'] = true;
      response_obj['contract_id'] = contract_id;
      response_obj['description'] = 'Successfully created Fidelis tokens for escrow';
      
    } catch (err) {
      // If network request, display verbose error
      if (err.response) {
        response_obj["message"] = err.response.text;
        response_obj["status"] = err.response.status;
        response_obj["description"] = "Network request unsuccessful";
      } else {
        //TODO: Handle errors unrelated to network
        response_obj["description"] = `Could not create the fidelis tokens for escow, please check the logs`;
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
    async deploy (txn_inputs) {
 
        let response_obj = {
            'success': false
        };
        try {
            const localInts = 2
            const localBytes = 1
            const globalInts = 7
            const globalBytes = 12
    
            let op = "apply";
            let start_date = txn_inputs.start_date;
            let end_date = txn_inputs.end_date;
            let loan_amount = txn_inputs.loan_amount;
            let interest = txn_inputs.interest_rate;
            let balance = "55";

            let args = [];
            let assets = [parseInt(process.env.USDCA_TOKEN_RESERVE_ASSETID), parseInt(process.env.TRUST_TOKEN_RESERVE_ASSETID), parseInt(process.env.BACKER_TOKEN_RESERVE_ASSETID)];
            
            args.push(new Uint8Array(Buffer.from(op)));
            args.push(new Uint8Array(Buffer.from(balance)));
            args.push(new Uint8Array(Buffer.from(interest)));
            args.push(new Uint8Array(Buffer.from(start_date)));
            args.push(new Uint8Array(Buffer.from(end_date)));
            args.push(new Uint8Array(Buffer.from(balance)));

            
            let accounts = [pool_address, txn_inputs.receiver_address, txn_inputs.agent_address];
    
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
            console.log(algosdk.getApplicationAddress(appId));

            //fund the escrow
            let seed_response = await transactionUtilities.seedAccWithAlgos(
              algosdk.getApplicationAddress(appId)
            );

             console.log('pool error', seed_response['pool-error']);
             response_obj['pool_error'] = seed_response['pool-error'];
    
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
                    response_obj['description']= 'Could not deploy contract, check th application logs for more information';
                    console.log(err);
    
                }
            }
    
            return response_obj;
  }
}

let params = {
    "receiver_address": "ZBHW3NPKQP45BVK2JHBVIIWLC2JD4BULREVCIUHAMQOEZF4BNPQDWHZPDA",
    "receiver_mnemonic": "soda legend agent reject argue artefact genius palace ranch initial spin street tornado exit table review recipe kit comfort artefact metal elephant moment absorb milk",
    "receiver_staked_points": "1",
    "loan_amount": "50",
    "interest_rate": "1",
    "agent_address": "IQDPRKBXGWTC3UQ25JJOBQVGKQSV3B55XR4YSZV6TPYE5V3XI3S7ZRECHM",
    "agent_mnemonic": "hurdle crash pair soul issue estate solution economy hospital frog cinnamon enemy reveal like remain interest off token fiber century corn discover predict absent drink",
    "start_date": "12343450",
    "end_date": "16589944",
    "backers": [
        {
        "points": "2.5",
        "address": "V6PZQZ3DPRALNRK6EPPNFRK2NF5DI3VNZBX4C5VEQDCYORSJTK2PYHWQVQ",
        "mnemonic": "lift insane audit subject liar celery wreck mixed crater peace chief forum injury student beyond seven virtual remove outside strong asset shallow supply absent shock",
        "earned": "2.5"
        },

        {
        "points": "2.5",
        "address": "6MYSPXEKKMAW4SMTCNXPF3QDTWQBY2Z4YTFXUUYWSLR2EOJHV66XNXLY5E",
        "mnemonic": "arrest hedgehog toilet expose beef powder vast just cost pink coffee round evolve decade shell glare hunt cousin stay pioneer execute close drive able denial",
        "earned": "2.5"
        }
    ]
}

let fidelisContracts = new FidelisContracts();


// fidelisContracts.initiationFlow(params, 102566748).then((data) => {
//   console.log(data);
// });

// fidelisContracts.deploy(params).then((data) => {
//   console.log(data);
// });


// fidelisContracts.escrowOptIn(102566748).then((data) => {
//   console.log(data);
// });


 fidelisContracts.optIn(
  {
    address: "ZBHW3NPKQP45BVK2JHBVIIWLC2JD4BULREVCIUHAMQOEZF4BNPQDWHZPDA",
    mnemonic: "soda legend agent reject argue artefact genius palace ranch initial spin street tornado exit table review recipe kit comfort artefact metal elephant moment absorb milk",
  }
).then((data) => {
  console.log(data);
});

// fidelisContracts.invest(
//   {
//     receiver_address: "ZBHW3NPKQP45BVK2JHBVIIWLC2JD4BULREVCIUHAMQOEZF4BNPQDWHZPDA",
//     receiver_mnemonic: "soda legend agent reject argue artefact genius palace ranch initial spin street tornado exit table review recipe kit comfort artefact metal elephant moment absorb milk",
//     receiver_staked_points: "1"
//   }, INVESTOR_TYPE.BENEFICIARY, 102554997
// ).then((data) => {
//   console.log(data);
// });


