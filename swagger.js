const swaggerAutogen = require('swagger-autogen')({'openapi':'3.0.0'});

const doc = {
    info: {
      title: 'Fidelis API DOC',
      description: 'Description',
    },
    host: 'http://13.246.47.176',
    schemes: ['http'],
    basePath:"/contracts",
    consumes: ['application/json'], 
    produces: ['application/json'],

    components:{
        '@schemas': {
            'Wallet': {
                'type': 'object',
                'properties': {
                    'address': {
                        type: 'string',
                        format: 'string',
                        description: 'Wallet address',
                        example:"25AY6SN7X7PES63ETNSGLQG6D7TY3YV6SEQNJKYRMVTFSIWFZ46TW73HSI"
                    },
                    'amount': {
                        type: 'integer',
                        format: 'int32',
                        description: 'Wallet balance',
                        example:1000
                    },
                    'assets': {
                        type: 'array',
                        format: 'int32',
                        description: 'List of assets (tokens) the wallet holds',
                        items:[
                            {
                                type:'object',
                                properties:{
                                    amount: {
                                        type: 'number',
                                        format: 'double',
                                        description: 'Asset balance',
                                        example:25.6
                                    },
                                    'asset-id': {
                                        type: 'integer',
                                        format: 'int32',
                                        description: 'Asset / token global identifier',
                                        example:1
                                    },
                                    'asset-name': {
                                        type: 'string',
                                        format: 'string',
                                        description: 'Asset / token name',
                                        example:"Fidelis Trust"
                                    },
                                    'unitName': {
                                        type: 'string',
                                        format: 'string',
                                        description: 'Asset / token unit name',
                                        example:"Fidelis Trust"
                                    },
                                    'is-frozen': {
                                        type: 'boolean',
                                        format: '-',
                                        description: 'AAsset / token status',
                                        example:false
                                    },
                                }
                            }
                        ]
                    },
                    'min-balance': {
                        type: 'integer',
                        format: 'int32',
                        description: 'Wallet required minimum balance',
                        example: 30000
                    },
                    'round': {
                        type: 'integer',
                        format: 'int32',
                        description: 'Block Chain current round',
                        example:4999
                    },
                    'status': {
                        type: 'string',
                        format: 'status',
                        description: 'Status can be Offline or Online, indicates wallet / account participation on the block chain',
                        example:false
                    },
                    'total-assets-opted-in': {
                        type: 'integer',
                        format: 'int32',
                        description: 'total number of unique assets the  account has opted-in to holding/recieving',
                        example:0
                    },
                    'total-apps-opted-in': {
                        type: 'integer',
                        format: 'int32',
                        description: 'total number of applications / contracts the  account has opted-in to',
                        example:0,
                    }
                }
            },
            'transaction': {
                'type': 'object',
                'properties': {
                    'id': {
                        type: 'string',
                        format: 'string',
                        description: 'Transaction id',
                        example:"B7ZR262KXGJAJVPOLBVOOOCE3PKWMAKLN3CJA7QSBPM2FYOU46VQ"
                    },
                    'tx-type': {
                        type: 'string',
                        format: 'string',
                        description: 'Transaction type',
                        example:"axfer"
                    },
                    'sender': {
                        type: 'string',
                        format: 'address',
                        description: 'Sender Wallet / Account addrress',
                        example:'TNI7KYBY2OLEASNX5TIQQT7BKFTLIXOJDJ4KUXJJLICYKYIVNPEFHX3CQM'
                    },
                    'fee': {
                        type: 'integer',
                        format: 'int32',
                        description: 'Transaction fee',
                        example:'1000'
                    },
                    'note':{
                        type: 'string',
                        format: 'note',
                        description: 'Any addition text passed with the transaction suchh as a reference',
                        example:'c2VlZCBhY2NvdW50IHdpdGggMSBBTEdP'
                    },
                    'confirmed-round': {
                        type: 'integer',
                        format: 'int32',
                        description: 'Round the transaction was executed in',
                        example:1716
                    },
                    'payment-transaction': {
                        type: 'object',
                        properties:{
                            'amount': {
                                type: 'integer',
                                format: 'int32',
                                description: 'Transaction amount',
                                example:1000000
                            },
                            'receiver': {
                                type: 'string',
                                format: 'int32',
                                description: 'Reciever wallet / account address',
                                example:'DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ'
                            },
                            'close-amount':{
                                type: 'integer',
                                format: 'int32',
                            },
                        }
                    },
                    'asset-transfer-transaction': {
                        type: 'object',
                        properties:{
                            'amount': {
                                type: 'number',
                                format: 'double',
                                description: 'Transaction amount',
                                example:25.55
                            },
                            'asset-id': {
                                type: 'integer',
                                format: 'int32',
                                description: 'Transaction asset / token global id',
                                example:1
                            },
                            'receiver': {
                                type: 'string',
                                format: 'int32',
                                description: 'Reciever wallet / account address',
                                example:'DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ'
                            },
                            'close-amount':{
                                type: 'integer',
                                format: 'int32',
                            },
                        }
                    },
                    'signature': {
                        type: 'object',
                        properties:{
                            'sig': {
                                type: 'string',
                                format: 'signature',
                                description: 'Transaction signature',
                                example:'t9FHIieYGRH74Ox/jaf7Yjy2RqJZ7/0sV6ArfN1HVJ3z035CvKZNWaUqIVbT+K4/Opra5Him6zOqv2OhyILrCA=='
                            }
                        }
                    },
                    'genesis-hash': {
                        type: 'string',
                        format: 'hash',
                        description: 'First block on the chain',
                        example:'jwew/Hb8y3ekTKRAL0aRePuaqNEYunPsB55c210piUg='
                    },
                }
            },
            'transactions-object':{
                'type':'object',
                'properties':{
                    'current-round': {
                        type: 'integer',
                        format: 'int64',
                        description: 'round transaction went through',
                        example:"52826"
                    },
                    'transactions': {
                        type: 'array',
                        description: 'List of transations',
                        items:[
                            {
                                'type': 'object',
                                'properties': {
                                    'id': {
                                        type: 'string',
                                        format: 'string',
                                        description: 'Transaction id',
                                        example:"B7ZR262KXGJAJVPOLBVOOOCE3PKWMAKLN3CJA7QSBPM2FYOU46VQ"
                                    },
                                    'tx-type': {
                                        type: 'string',
                                        format: 'string',
                                        description: 'Transaction type',
                                        example:"axfer"
                                    },
                                    'sender': {
                                        type: 'string',
                                        format: 'address',
                                        description: 'Sender Wallet / Account addrress',
                                        example:'TNI7KYBY2OLEASNX5TIQQT7BKFTLIXOJDJ4KUXJJLICYKYIVNPEFHX3CQM'
                                    },
                                    'fee': {
                                        type: 'integer',
                                        format: 'int32',
                                        description: 'Transaction fee',
                                        example:'1000'
                                    },
                                    'note':{
                                        type: 'string',
                                        format: 'note',
                                        description: 'Any addition text passed with the transaction suchh as a reference',
                                        example:'c2VlZCBhY2NvdW50IHdpdGggMSBBTEdP'
                                    },
                                    'confirmed-round': {
                                        type: 'integer',
                                        format: 'int32',
                                        description: 'Round the transaction was executed in',
                                        example:1716
                                    },
                                    'payment-transaction': {
                                        type: 'object',
                                        properties:{
                                            'amount': {
                                                type: 'integer',
                                                format: 'int32',
                                                description: 'Transaction amount',
                                                example:1000000
                                            },
                                            'receiver': {
                                                type: 'string',
                                                format: 'int32',
                                                description: 'Reciever wallet / account address',
                                                example:'DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ'
                                            },
                                            'close-amount':{
                                                type: 'integer',
                                                format: 'int32',
                                            },
                                        }
                                    },
                                    'asset-transfer-transaction': {
                                        type: 'object',
                                        properties:{
                                            'amount': {
                                                type: 'number',
                                                format: 'double',
                                                description: 'Transaction amount',
                                                example:25.55
                                            },
                                            'asset-id': {
                                                type: 'integer',
                                                format: 'int32',
                                                description: 'Transaction asset / token global id',
                                                example:1
                                            },
                                            'receiver': {
                                                type: 'string',
                                                format: 'int32',
                                                description: 'Reciever wallet / account address',
                                                example:'DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ'
                                            },
                                            'close-amount':{
                                                type: 'integer',
                                                format: 'int32',
                                            },
                                        }
                                    },
                                    'signature': {
                                        type: 'object',
                                        properties:{
                                            'sig': {
                                                type: 'string',
                                                format: 'signature',
                                                description: 'Transaction signature',
                                                example:'t9FHIieYGRH74Ox/jaf7Yjy2RqJZ7/0sV6ArfN1HVJ3z035CvKZNWaUqIVbT+K4/Opra5Him6zOqv2OhyILrCA=='
                                            }
                                        }
                                    },
                                    'genesis-hash': {
                                        type: 'string',
                                        format: 'hash',
                                        description: 'First block on the chain',
                                        example:'jwew/Hb8y3ekTKRAL0aRePuaqNEYunPsB55c210piUg='
                                    },
                                }
                            }
                        ]
                    },
                }
            },
            'token-asset': {
                'type': 'object',
                'properties': {
                    'asset-index':{
                        type: 'integer',
                        format: 'int32',
                        description: 'Token asset global index',
                        example:1000
                    },
                    'confirmed-round': {
                        type: 'integer',
                        format: 'int32',
                        description: 'Transaction confirmed round',
                        example:1000
                    },
                    'pool-error': {
                        type: 'string',
                    }                    
                }
            },
        },
        '@parameters':{
            'uniqueIdentifier':{
                type: 'string',
                format: 'identifier',
                description: 'An identifier for the user, this cannot be changed',
                required: true
            }
        }
    }
  };


const outputFile = './docs/UI/apidocs.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
// swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
//     require('./app.js');
//   });