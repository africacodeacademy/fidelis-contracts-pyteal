
/**
 * errorParser
 * 
 * @param {JSON} errorObject 
 * @returns 
 */
exports.errorParser = (errorObject) => {
    console.log(errorObject.response)
    if(['ECONNREFUSED'].includes(errorObject.code)){
        return `Microservice unreachable at ${errorObject.address}:${errorObject.port}`
    }else{
        return errorObject
    }
}
