
/**
 * errorParser
 * 
 * @param {JSON} errorObject 
 * @returns 
 */
exports.errorParser = (errorObject) => {
    
    console.log(errorObject.response.data.errors,  "keys ", Object.keys(errorObject), "type", typeof errorObject)
    // return errorObject
    
    if(['ECONNREFUSED'].includes(errorObject.code)){
        return {"ERROR":`Microservice unreachable at ${errorObject.address}:${errorObject.port}`}
    }else if([400].includes(errorObject.status)){
        return {"ERROR":errorObject.response.data.errors}
    }else{
        return errorObject
    }
}
