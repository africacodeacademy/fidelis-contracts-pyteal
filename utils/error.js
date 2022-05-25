
/**
 * errorParser
 * 
 * @param {JSON} errorObject 
 * @returns 
 */
exports.errorParser = (errorObject) => {
    
    console.log(Object.keys(errorObject.response),  "keys ", Object.keys(errorObject))
    // return errorObject
    
    if(['ECONNREFUSED'].includes(errorObject.code)){
        return {"ERROR":`Microservice unreachable at ${errorObject.address}:${errorObject.port}`}
    }else if([400].includes(errorObject.status)){
        return {"ERROR":errorObject.response.body.message}
    }else{
        return errorObject
    }
}
