
/**
 * errorParser
 * 
 * @param {JSON} errorObject 
 * @returns 
 */
exports.errorParser = (errorObject) => {
    
    console.log(errorObject.status,  "keys ", Object.keys(errorObject), "type", typeof errorObject)
    return errorObject
    
    // if(['ECONNREFUSED'].includes(errorObject.code)){
    //     return `Microservice unreachable at ${errorObject.address}:${errorObject.port}`
    // }else{
    //     return errorObject
    // }
}
