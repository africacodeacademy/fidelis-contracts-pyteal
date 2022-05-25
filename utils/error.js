
/**
 * errorParser
 * 
 * @param {JSON} errorObject 
 * @returns 
 */
exports.errorParser = (errorObject) => {
    
    console.log(errorObject,  "keys ", Object.keys(errorObject))
    return errorObject
    
    // if(['ECONNREFUSED'].includes(errorObject.code)){
    //     return `Microservice unreachable at ${errorObject.address}:${errorObject.port}`
    // }else{
    //     return errorObject
    // }
}
