const assetsUtils = require("../utils/assets")
const errorUtils = require("../utils/error")
/**
 * mintTrustTokensAsset
 * 
 */
 exports.mintTrustTokensAsset = async(req, res, next) => {
    /**
     * #swagger.tags = ['Fidelis Trust Tokens']
     * #swagger.summary = 'Mint'
     * #swagger.description = 'Endpoint mints new trust token assets'
    #swagger.requestBody {
        required: true,
        "@content": { 
            "application/json": {
              "schema": {
                    type: "object",
                    properties: {
                        quantity: {
                            type: "number",
                            format:"double",
                            description: 'Quantity of trust tokens to mint',
                            example:2000.00
                        }                    
                    },
                    required: ["quantity"]
                }
            },
        }        
    }
    #swagger.responses[200] = {
        description: 'Wallet Object',
        schema: {$ref:'#/components/schemas/token-asset'}
    }  
     */
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
 */
exports.mintBackerTokensAsset = async(req, res, next) => {
    /**
     * #swagger.tags = ['Fidelis Backer Tokens']
     * #swagger.summary = 'Mint'
     * #swagger.description = 'Endpoint mints new backer token assets'
    #swagger.requestBody {
        required: true,
        "@content": { 
            "application/json": {
              "schema": {
                    type: "object",
                    properties: {
                        quantity: {
                            type: "number",
                            format:"double",
                            description: 'Quantity of backer tokens to mint',
                            example:2000.00
                        }                    
                    },
                    required: ["quantity"]
                }
            },
        }        
    }
    #swagger.responses[200] = {
        description: 'Wallet Object',
        schema: {$ref:'#/components/schemas/token-asset'}
    }  
     */
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