const  walletUtils = require("../utils/wallet")
const  transactionUtils = require("../utils/transaction")
const errorUtils =  require("../utils/error")

/**
 * register user wallet
 */
 exports.registerUserWallet = async(req, res, next) => {

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
        const {
            uniqueIdentifier
        } = req.body

        var wallet = await walletUtils.createWallet(uniqueIdentifier)

        return res.send(wallet)

    }
    catch (err) {
        console.log("err", err);
        err = errorUtils.errorParser(err)
        res.status(500).json(err)
        return next(err)
    }
}


/**
 * getWalletDetails
 * 
 */
exports.getWalletDetails = async(req, res, next) => {
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
        const {
            addr
        } = req.query

        var wallet = await walletUtils.getWalletInfo(addr)

        return res.send(wallet)

    }
    catch (err) {
        console.log("err", Object.keys(err));
        err = errorUtils.errorParser(err)
        res.status(500).json({"ERROR": err})
        return next(err)
    }
}

/**
 * getWallets
 * 
 */
exports.getWallets = async(req, res, next) => {
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
        
        var wallets = await walletUtils.getAllWallets()

        return res.send(wallets)

    }
    catch (err) {
        console.log("err", err);
        err = errorUtils.errorParser(err)
        res.status(500).json({"ERROR": err})
        return next(err)
    }
}

/**
 * fetchAccountTransactions
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.fetchAccountTransactions = async(req, res, next) => {
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

        const {
            addr
        } = req.query
        
        if(typeof addr === "undefined")
        {
            return res.status(400).json({"ERROR":`Invalid address, ${addr}`})
        }

        var transactionsData = await transactionUtils.getWalletTransactions(addr)

        return res.send(transactionsData)

    }
    catch (err) {
        console.log("err", err);
        err = errorUtils.errorParser(err)
        res.status(500).json({"ERROR": err})
        return next(err)
    }
}