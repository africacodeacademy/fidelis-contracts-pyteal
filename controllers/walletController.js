const walletUtils = require("../utils/wallet");
const transactionUtils = require("../utils/transaction");
const errorUtils = require("../utils/error");

/**
 * register user wallet
 */
exports.registerUserWallet = async (req, res, next) => {
  /**
     * #swagger.tags = ['Wallet / Account']
     * #swagger.summary = 'Register'
     * #swagger.description = 'Endpoint creates new user wallets and accounts on the blockchain, 
    wallets are seeded with 2 assets 25 Fidelis trust and Backer token assets. Wallets are 
    also seeded with 1 algo'
    #swagger.requestBody {
        required: true,
        "@content": { 
            "application/json": {
              "schema": {
                    type: "object",
                    properties: {
                        uniqueIdentifier: {
                            type: "string",
                            description: 'An identifier for the user, this cannot be changed',
                            example:"user-1"
                        }                    
                    },
                    required: ["uniqueIdentifier"]
                }
            },
        }        
    }
    #swagger.responses[200] = {
        description: 'Wallet Object',
        schema: {$ref:'#/components/schemas/Wallet'}
    }  
     */
  try {
    const { uniqueIdentifier } = req.body;

    var wallet = await walletUtils.createWallet(uniqueIdentifier);

    return res.send(wallet);
  } catch (err) {
    err = errorUtils.errorParser(err);
    res.status(400).send(err);
    // return next(err)
  }
};

/**
 * getWalletDetails
 *
 */
exports.getWalletDetails = async (req, res, next) => {
  /**
     * #swagger.tags = ['Wallet / Account']
     * #swagger.summary = 'Get wallet'
     * #swagger.description = 'Endpoint takes a wallet address and returns wallet information  for the given address'
    #swagger.parameters["addr"] = {
        required: true,
        in:'query',
        description: 'An identifier for the user, this cannot be changed',
        type: "string",
    
    }
    #swagger.responses[200] = {
        description: 'Wallet Object',
        schema: {$ref:'#/components/schemas/Wallet'}
    }  
     */
  try {
    const { addr } = req.query;

    var wallet = await walletUtils.getWalletInfo(addr);

    return res.send(wallet);
  } catch (err) {
    console.log("err", Object.keys(err));
    err = errorUtils.errorParser(err);
    res.status(500).json({ ERROR: err });
    // return next(err)
  }
};

/**
 * getWallets
 *
 */
exports.getWallets = async (req, res, next) => {
  /**
     * #swagger.tags = ['Wallet / Account']
     * #swagger.summary = 'Retrieve wallets'
     * #swagger.description = 'Use this endpoint to get a list of all platform wallets that are on the blockchain'

    #swagger.responses[200] = {
        description: 'List of Wallet Objects',
        schema: {$ref:'#/components/schemas/Wallet'}
    }  
     */
  try {
    var wallets = await walletUtils.getAllWallets();

    return res.send(wallets);
  } catch (err) {
    console.log("err", err);
    err = errorUtils.errorParser(err);
    res.status(500).json({ ERROR: err });
    // return next(err)
  }
};

/**
 * fetchAccountTransactions
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.fetchAccountTransactions = async (req, res, next) => {
  /**
     * #swagger.tags = ['Wallet / Account']
     * #swagger.summary = 'Retrieve wallet transactions'
     * #swagger.description = 'Use this endpoint to get a list of all wallet / account transactions'

    #swagger.responses[200] = {
        description: 'List of transaction objects',
        schema: {$ref:'#/components/schemas/transactions-object'}
    }  
     */
  try {
    const { addr } = req.query;

    if (typeof addr === "undefined") {
      return res.status(400).json({ ERROR: `Invalid address, ${addr}` });
    }

    var transactionsData = await transactionUtils.getWalletTransactions(addr);

    return res.send(transactionsData);
  } catch (err) {
    console.log("err", err);
    err = errorUtils.errorParser(err);
    res.status(500).json({ ERROR: err });
    // return next(err)
  }
};

/**
 * transaferPoints
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.transaferPoints = async (req, res, next) => {
  /**
     * #swagger.tags = ['Fidelis Trust Tokens', 'Fidelis Backer Tokens']
     * #swagger.summary = 'Transfer points'
     * #swagger.description = 'Use this endpoint to transfer tokens between wallet addresses'
    #swagger.requestBody {
        required: true,
        "@content": { 
            "application/json": {
              "schema": {
                    type: "object",
                    properties: {
                        receiver_address: {
                            type: "string",
                            description: 'Recieving wallet address',
                            example:"NSDLUILQUOY3W98ENAOWEIU9DWHOISHCLJCJ49E0"
                        },
                        sender_address: {
                            type: "string",
                            description: 'Sender wallet address',
                            example:"KLASJF7A83YY0QUJDOAISUD9238HDIASUGDGOQ83"
                        },
                        sender_sk: {
                            type: "string",
                            description: 'Sender wallet secrete key',
                            example:"njgsd87t238dhwisd"
                        },
                        receiver_sk: {
                            type: "string",
                            description: 'Reciever wallet secrete key',
                            example:"njgsd87t238dhwisd"
                        },
                        amount: {
                            type: "Number",
                            description: 'Amount to be sent',
                            example:5.0
                        },
                        tokenAssetId: {
                            type: "Number",
                            description: 'Identifier of token asset to be sent',
                            example:5
                        },
                        note: {
                            type: "String",
                            description: 'Transaction Reference',
                            example:"token sent"
                        }      
                    },
                    required: ["receiver_address","sender_address","sender_sk","receiver_sk","amount","tokenAssetId"]
                }
            },
        }        
    }
    #swagger.responses[200] = {
        description: 'transaction object',
        schema: {$ref:'#/components/schemas/transactions-object'}
    }  
     */
  try {
    var {
      receiver_address,
      sender_address,
      sender_sk,
      receiver_sk,
      amount,
      tokenAssetId,
      note,
    } = req.body;

    if (typeof receiver_address === "undefined") {
      return res
        .status(400)
        .json({ ERROR: `Invalid address, ${receiver_address}` });
    }

    if (typeof sender_address === "undefined") {
      return res
        .status(400)
        .json({ ERROR: `Invalid address, ${sender_address}` });
    }

    if (typeof sender_sk === "undefined") {
      return res.status(400).json({ ERROR: `Invalid sender_sk, ${sender_sk}` });
    }

    if (typeof receiver_sk === "undefined") {
      return res
        .status(400)
        .json({ ERROR: `Invalid receiver_sk, ${receiver_sk}` });
    }

    if (typeof amount === "undefined") {
      return res.status(400).json({ ERROR: `Invalid amount, ${amount}` });
    }

    if (typeof tokenAssetId === "undefined") {
      return res
        .status(400)
        .json({ ERROR: `Invalid tokenAssetId, ${tokenAssetId}` });
    }

    sender_sk = new Uint8Array(sender_sk.split(","));
    receiver_sk = new Uint8Array(receiver_sk.split(","));
    var transactionsData = await transactionUtils.transferTokens(
      receiver_address,
      sender_address,
      sender_sk,
      receiver_sk,
      amount,
      tokenAssetId,
      note
    );

    return res.send(transactionsData);
  } catch (err) {
    console.log("err", err);
    err = errorUtils.errorParser(err);
    res.status(500).json({ ERROR: err });
    // return next(err)
  }
};
