const  walletUtils = require("../utils/wallet")
const  transactionUtils = require("../utils/transaction")
const errorUtils =  require("../utils/error")

/**
 * register user wallet
 */
 exports.registerUserWallet = async(req, res, next) => {

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
        res.status(500).json({"ERROR": err})
        return next(err)
    }
}


/**
 * getWalletDetails
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.getWalletDetails = async(req, res, next) => {

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
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.getWallets = async(req, res, next) => {

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