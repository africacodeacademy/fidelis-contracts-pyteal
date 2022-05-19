const assetsUtils = require("../utils/assets")
const errorUtils = require("../utils/error")
/**
 * mintTrustTokensAsset
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
 exports.mintTrustTokensAsset = async(req, res, next) => {

    try {  

        const {
            quantity
        } = req.body


        var assetInfo = await assetsUtils.mintFidelisTrustTokens(quantity)

        return res.send(assetInfo)

    }
    catch (err) {
        // console.log("err", err);
        err = errorUtils.errorParser(err)
        res.status(500).json({"ERROR": err})
        return next(err)
    }
}


/**
 * mintBackerTokensAsset
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.mintBackerTokensAsset = async(req, res, next) => {

    try {  

        const {
            quantity
        } = req.body


        var assetInfo = await assetsUtils.mintFidelisBackerTokens(quantity)

        return res.send(assetInfo)

    }
    catch (err) {
        console.log("err", err);
        err = errorUtils.errorParser(err)
        res.status(500).json({"ERROR": err})
        return next(err)
    }
}