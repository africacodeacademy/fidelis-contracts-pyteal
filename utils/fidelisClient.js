const algosdk = require("algosdk");
const fs = require("fs/promises");
const dotenv = require("dotenv");
const INVESTOR_TYPE = require('../constants/investorTypes');

const walletUtils = require("./wallet");

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

  async registerAgent(txn_inputs) {
    let response_obj = {
      success: false,
    };

    let response = await this.deploy(txn_inputs);
    this.contract_id = response.contract_id ?? null;

    if (!this.contract_id) {
      return response;
    }
    try {
      let op = "register_agent";

      let accounts = [sender, txn_inputs.agent_address];
      let args = [];
      args.push(new Uint8Array(Buffer.from(op)));
      let params = await algodClient.getTransactionParams().do();

      console.log("Registering Agent. . . . ");
      let txn = algosdk.makeApplicationOptInTxn(
        sender,
        params,
        this.contract_id,
        args,
        accounts
      );

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
      let transactionResponse = await algodClient
        .pendingTransactionInformation(txId)
        .do();
      let appId = transactionResponse["application-index"];
      console.log("Registered agent for app-id: ", this.contract_id);

      response_obj["success"] = true;
      response_obj["contract_id"] = this.contract_id;
      response_obj["description"] = "Successfully registered agent";
    } catch (err) {
      // If network request, display verbose error
      if (err.response) {
        response_obj["message"] = err.response.text;
        response_obj["status"] = err.response.status;
        response_obj["description"] = "Network request unsuccessful";
      } else {
        //TODO: Handle errors unrelated to network
        response_obj["description"] = "Could not register agent";
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
  async initiate(txn_inputs) {
    let response_obj = {
      success: false,
    };

    let response = await this.registerAgent(txn_inputs);

    if (!response.success) {
      response_obj["message"] =
        "Agent needs to be successfully registered first";
      return response;
    }

    try {
      let op = "apply";
      let assets = [
        process.env.USDCA_TOKEN_RESERVE_ASSETID,
        process.env.TRUST_TOKEN_RESERVE_ASSETID,
        process.env.BACKER_TOKEN_RESERVE_ASSETID,
      ];
      let args = [];
      let accounts = [];
      accounts.push(txn_inputs.receiver_address);
      accounts.push(txn_inputs.agent_address);
      //accounts.push(pool_address);
      accounts.push(reserve_address);
      args.push(new Uint8Array(Buffer.from(op)));
      let params = await algodClient.getTransactionParams().do();

      console.log("Applying for loan. . . . ");

      for (let i = 0; i < txn_inputs.backers.length; i++) {
        //accounts.push(txn_inputs.backers[i].address);
      }

      let txn1 = algosdk.makeApplicationNoOpTxn(
        sender,
        params,
        this.contract_id,
        args,
        accounts,
        [],
        [20]
      );

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
      let transactionResponse = await algodClient
        .pendingTransactionInformation(txId)
        .do();
      let appId = transactionResponse["application-index"];
      console.log("modified app with app-id: ", appId);

      response_obj["success"] = true;
      response_obj["contract_id"] = appId;
      response_obj["description"] = "Successfully applied for loan";
    } catch (err) {
      // If network request, display verbose error
      if (err.response) {
        response_obj["message"] = err.response.text;
        response_obj["status"] = err.response.status;
        response_obj["description"] = "Network request unsuccessful";
      } else {
        //TODO: Handle errors unrelated to network
        response_obj["description"] = "Could not apply for loan";
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
  async buildGroupTxn(
    backers,
    backerAssetId,
    beneficiary,
    trustAssetId,
    receiver_address
  ) {
    let response_obj = {
      success: false,
    };

    // let response = await this.registerAgent(txn_inputs);

    let txns = [];
    // get suggested parameters
    const suggestedParams = await client.getTransactionParams().do();

    let backerTxns = backers.map((backer) => {
      return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: backer.address,
        note: "fidelis backing transaction",
        suggestedParams: suggestedParams,
        to: receiver_address,
        closeRemainderTo: backer.address,
        amount: backer.points,
        assetIndex: backerAssetId,
        revocationTarget: undefined,
        rekeyTo: undefined,
      });
    });

    let beneficiaryStakeTxn =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: beneficiary.address,
        note: "fidelis backing transaction",
        suggestedParams: suggestedParams,
        to: receiver_address,
        closeRemainderTo: beneficiary.address,
        amount: beneficiary.points,
        assetIndex: trustAssetId,
        revocationTarget: undefined,
        rekeyTo: undefined,
      });

    txns.push(beneficiaryStakeTxn);
    txns = txns.concat(backerTxns);

    // assign group id to transactions
    algosdk.assignGroupID(txns);

    beneficiaryStakeTxn = txns[0];
    let beneficiarySk = await walletUtils.getSk(beneficiaryStakeTxn.from);

    const signedBeneficiaryTxn = beneficiaryStakeTxn.signTxn(beneficiarySk);
    var signedTxns = [];
    signedTxns.push(signedBeneficiaryTxn);

    for (let index = 1; index < txns.length; index++) {
      let txn = txns[index];
      //get txn address sk
      let sk = await walletUtils.getSk(txn.from);
      txn = txn.signTxn(sk);
      signedTxns.push(txn);
    }
  }

    /**
     * 
     * @param {*} txn_inputs 
     * @returns 
     */
    async initiationFlow(txn_inputs)
    {
       /* let deploy_response = await this.deploy(txn_inputs);
        let response_obj = {
            'success': false
        };

        if(!deploy_response.success)
        {
            return deploy_response;
        }
        this.contract_id = deploy_response.contract_id;

        */
        
        
        this.contract_id = 101488900;
        /*let opt_in_acc = {
            address: 'THFBKZU22YYS33BRR4YFM6JLRTMNIZKARZQVYUMWHWTUFR5WB6HJGTBCDA',
            mnemonic: "become relax stool love pupil detect grocery oppose mansion bracket witness horror theme reopen sign glide recall loan heavy arch asset stock leg above recall"
        }*/

        let opt_in_acc = {
            address: txn_inputs.receiver_address,
            mnemonic: txn_inputs.receiver_mnemonic
        }
        console.log(opt_in_acc.mnemonic)
        let opt_in_res = await this.optIn(opt_in_acc);
        console.log(opt_in_res);

        

        
        //Add Beneficiary
        let beneficiary_response = await this.invest(txn_inputs, INVESTOR_TYPE.BENEFICIARY);
        return beneficiary_response;
    }

    /**
     * 
     * @param {*} txn_inputs 
     * @param {*} investor_type 
     * @returns 
     */
    async invest (txn_inputs, investor_type)
    {
        let sender_addr = "";
        let sender_mnemonic = "";
        let sender_acc = null;
        let response_obj = {
            'success': false
        };


        if(!this.contract_id)
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
                    
                    break;

                case INVESTOR_TYPE.BACKER:
                    assets.push(parseInt(process.env.BACKER_TOKEN_RESERVE_ASSETID));
                    args.push(new Uint8Array(Buffer.from(txn_inputs.points)));
                    sender_mnemonic = txn_inputs.mnemonic;
                    sender_acc = algosdk.mnemonicToSecretKey(sender_mnemonic);

                    break;

            
                default:
                    response_obj['message'] = "Wrong investor type provided"
                    return response_obj;
            }
            args.push(new Uint8Array(Buffer.from(encryption_key)));

            let params = await algodClient.getTransactionParams().do();
    
            console.log(`Adding Recipient ...`);
    
            let  txn = algosdk.makeApplicationNoOpTxn(sender_addr, params, this.contract_id, args, [], [], assets);

            let txId = txn.txID().toString();
    
            // Sign the transaction
            
            let signedTxn = txn.signTxn(sender_acc.sk);
            console.log("Signed transaction with txID: %s", txId);
    
            // Submit the transaction
            await algodClient.sendRawTransaction(signedTxn).do();
    
            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txId, 2);
    
            // print the app-id
            let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
            let appId = transactionResponse['application-index'];
            console.log(`Added ${investor_type} for app-id: `, this.contract_id);
    
            response_obj['success'] = true;
            response_obj['contract_id'] = this.contract_id;
            response_obj['description'] = `Successfully added ${investor_type}`;
    
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
                    response_obj['description']= `Could not add ${investor_type}`;
                    console.log(err);
    
                }
        }
        
        return response_obj;

    }

    async optIn(txn_inputs)
    {
        let response_obj = {
            'success': false
        };
        let sender_addr = txn_inputs.address;
        let sender_mnemonic = txn_inputs.mnemonic;
        let sk = '';
        
        if(sender_mnemonic !== "")
        {
           sk = algosdk.mnemonicToSecretKey(sender_mnemonic).sk;
        }
        else
        {
            sk = new Uint8Array(process.env.TOKEN_RESERVE_SK.split(","));
        }


        try
        {
            let params = await algodClient.getTransactionParams().do();
    
            console.log(`Opting in ...`);
    
            let  txn = algosdk.makeApplicationOptInTxn(sender_addr, params, this.contract_id);
    
            let txId = txn.txID().toString();
    
            // Sign the transaction
            
            let signedTxn = txn.signTxn(sk);
            console.log("Signed transaction with txID: %s", txId);
    
            // Submit the transaction
            await algodClient.sendRawTransaction(signedTxn).do();
    
            // Wait for confirmation
            await algosdk.waitForConfirmation(algodClient, txId, 2);
    
            // print the app-id
            let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
            let appId = transactionResponse['application-index'];
            console.log(`opted in`);
    
            response_obj['success'] = true;
            response_obj['contract_id'] = this.contract_id;
            response_obj['description'] = `Successfully opted in`;
    
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
                response_obj['description']= `Could not opt in`;
                console.log(err);

            }
    }

    return response_obj;
    }




    async deploy (txn_inputs) {
 
        let response_obj = {
            'success': false
        };
        try {
            const localInts = 0
            const localBytes = 0
            const globalInts = 2
            const globalBytes = 12
    
            let op = "apply";
            let start_date = txn_inputs.start_date;
            let end_date = txn_inputs.end_date;
            let loan_amount = txn_inputs.loan_amount;
            let interest = txn_inputs.interest_rate;

            console.log('token', process.env.USDCA_TOKEN_RESERVE_ASSETID);

            let args = [];
            let assets = [parseInt(process.env.USDCA_TOKEN_RESERVE_ASSETID)];
            
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
    "receiver_mnemonic": "list merit round cruel observe essence embark vendor hybrid satisfy oblige menu lava exile crane pact wing film salute half whisper recipe era abstract region",
    "receiver_staked_points": "25",
    "loan_amount": "50",
    "interest_rate": "1",
    "agent_address": "IQDPRKBXGWTC3UQ25JJOBQVGKQSV3B55XR4YSZV6TPYE5V3XI3S7ZRECHM",
    "start_date": "1234345",
    "end_date": "16589944",
    "backers": [
        {
        "points": 2.5,
        "address": "V6PZQZ3DPRALNRK6EPPNFRK2NF5DI3VNZBX4C5VEQDCYORSJTK2PYHWQVQ",
        "mnemonic": "lift insane audit subject liar celery wreck mixed crater peace chief forum injury student beyond seven virtual remove outside strong asset shallow supply absent shock",
        "earned": 2.5
        },

        {
        "points": 2.5,
        "address": "6MYSPXEKKMAW4SMTCNXPF3QDTWQBY2Z4YTFXUUYWSLR2EOJHV66XNXLY5E",
        "mnemonic": "arrest hedgehog toilet expose beef powder vast just cost pink coffee round evolve decade shell glare hunt cousin stay pioneer execute close drive able denial",
        "earned": 2.5
        }
    ]
}

let fidelisContracts = new FidelisContracts();


fidelisContracts.deploy(params).then((data)=>{
    console.log(data);
})
