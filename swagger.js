const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Fidelis API DOC",
    description: "Description",
  },
  host: "http://13.246.47.176",
  schemes: ["http"],
  basePath: "/contracts",
  consumes: ["application/json"],
  produces: ["application/json"],

  components: {
    "@schemas": {
      Wallet: {
        type: "object",
        properties: {
          address: {
            type: "string",
            format: "string",
            description: "Wallet address",
            example:
              "25AY6SN7X7PES63ETNSGLQG6D7TY3YV6SEQNJKYRMVTFSIWFZ46TW73HSI",
          },
          amount: {
            type: "integer",
            format: "int32",
            description: "Wallet balance",
            example: 1000,
          },
          assets: {
            type: "array",
            format: "int32",
            description: "List of assets (tokens) the wallet holds",
            items: {
              $ref: "#/components/schemas/token-asset",
            },
          },
          "min-balance": {
            type: "integer",
            format: "int32",
            description: "Wallet required minimum balance",
            example: 30000,
          },
          round: {
            type: "integer",
            format: "int32",
            description: "Block Chain current round",
            example: 4999,
          },
          status: {
            type: "string",
            format: "status",
            description:
              "Status can be Offline or Online, indicates wallet / account participation on the block chain",
            example: false,
          },
          "total-assets-opted-in": {
            type: "integer",
            format: "int32",
            description:
              "total number of unique assets the account has opted-in to holding/recieving",
            example: 0,
          },
          "total-apps-opted-in": {
            type: "integer",
            format: "int32",
            description:
              "total number of applications / contracts the account has opted-in to",
            example: 0,
          },
          "total-created-apps": {
            type: "integer",
            format: "int32",
            description:
              "total number of applications / contracts the account has created",
            example: 0,
          },
          "total-created-assets": {
            type: "integer",
            format: "int32",
            description:
              "total number of assets / tokens the account has created",
            example: 0,
          },
          account_mnemonic: {
            type: "string",
            format: "mnemonic",
            description: "Account secrete phrases",
            example: 0,
          },
          sk: {
            type: "string",
            description: "Wallet private key",
            example: 0,
          },
        },
      },
      transaction: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "string",
            description: "Transaction id",
            example: "B7ZR262KXGJAJVPOLBVOOOCE3PKWMAKLN3CJA7QSBPM2FYOU46VQ",
          },
          "tx-type": {
            type: "string",
            format: "string",
            description: "Transaction type",
            example: "axfer",
          },
          sender: {
            type: "string",
            format: "address",
            description: "Sender Wallet / Account addrress",
            example:
              "TNI7KYBY2OLEASNX5TIQQT7BKFTLIXOJDJ4KUXJJLICYKYIVNPEFHX3CQM",
          },
          fee: {
            type: "integer",
            format: "int32",
            description: "Transaction fee",
            example: "1000",
          },
          note: {
            type: "string",
            format: "note",
            description:
              "Any addition text passed with the transaction suchh as a reference",
            example: "c2VlZCBhY2NvdW50IHdpdGggMSBBTEdP",
          },
          "confirmed-round": {
            type: "integer",
            format: "int32",
            description: "Round the transaction was executed in",
            example: 1716,
          },
          "payment-transaction": {
            type: "object",
            properties: {
              amount: {
                type: "integer",
                format: "int32",
                description: "Transaction amount",
                example: 1000000,
              },
              receiver: {
                type: "string",
                format: "int32",
                description: "Reciever wallet / account address",
                example:
                  "DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ",
              },
              "close-amount": {
                type: "integer",
                format: "int32",
              },
            },
          },
          "asset-transfer-transaction": {
            type: "object",
            properties: {
              amount: {
                type: "number",
                format: "double",
                description: "Transaction amount",
                example: 25.55,
              },
              "asset-id": {
                type: "integer",
                format: "int32",
                description: "Transaction asset / token global id",
                example: 1,
              },
              receiver: {
                type: "string",
                format: "int32",
                description: "Reciever wallet / account address",
                example:
                  "DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ",
              },
              "close-amount": {
                type: "integer",
                format: "int32",
              },
            },
          },
          signature: {
            type: "object",
            properties: {
              sig: {
                type: "string",
                format: "signature",
                description: "Transaction signature",
                example:
                  "t9FHIieYGRH74Ox/jaf7Yjy2RqJZ7/0sV6ArfN1HVJ3z035CvKZNWaUqIVbT+K4/Opra5Him6zOqv2OhyILrCA==",
              },
            },
          },
          "genesis-hash": {
            type: "string",
            format: "hash",
            description: "First block on the chain",
            example: "jwew/Hb8y3ekTKRAL0aRePuaqNEYunPsB55c210piUg=",
          },
        },
      },
      "transactions-object": {
        type: "object",
        properties: {
          "current-round": {
            type: "integer",
            format: "int64",
            description: "round transaction went through",
            example: "52826",
          },
          transactions: {
            type: "array",
            description: "List of transations",
            items: [
              {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "string",
                    description: "Transaction id",
                    example:
                      "B7ZR262KXGJAJVPOLBVOOOCE3PKWMAKLN3CJA7QSBPM2FYOU46VQ",
                  },
                  "tx-type": {
                    type: "string",
                    format: "string",
                    description: "Transaction type",
                    example: "axfer",
                  },
                  sender: {
                    type: "string",
                    format: "address",
                    description: "Sender Wallet / Account addrress",
                    example:
                      "TNI7KYBY2OLEASNX5TIQQT7BKFTLIXOJDJ4KUXJJLICYKYIVNPEFHX3CQM",
                  },
                  fee: {
                    type: "integer",
                    format: "int32",
                    description: "Transaction fee",
                    example: "1000",
                  },
                  note: {
                    type: "string",
                    format: "note",
                    description:
                      "Any addition text passed with the transaction suchh as a reference",
                    example: "c2VlZCBhY2NvdW50IHdpdGggMSBBTEdP",
                  },
                  "confirmed-round": {
                    type: "integer",
                    format: "int32",
                    description: "Round the transaction was executed in",
                    example: 1716,
                  },
                  "payment-transaction": {
                    type: "object",
                    properties: {
                      amount: {
                        type: "integer",
                        format: "int32",
                        description: "Transaction amount",
                        example: 1000000,
                      },
                      receiver: {
                        type: "string",
                        format: "int32",
                        description: "Reciever wallet / account address",
                        example:
                          "DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ",
                      },
                      "close-amount": {
                        type: "integer",
                        format: "int32",
                      },
                    },
                  },
                  "asset-transfer-transaction": {
                    type: "object",
                    properties: {
                      amount: {
                        type: "number",
                        format: "double",
                        description: "Transaction amount",
                        example: 25.55,
                      },
                      "asset-id": {
                        type: "integer",
                        format: "int32",
                        description: "Transaction asset / token global id",
                        example: 1,
                      },
                      receiver: {
                        type: "string",
                        format: "int32",
                        description: "Reciever wallet / account address",
                        example:
                          "DLNCZ3E3H4WYO5DZ66AH7XPTLR3A3ENQCTLJY25QCBZ4BAXLW4KAJS3MWQ",
                      },
                      "close-amount": {
                        type: "integer",
                        format: "int32",
                      },
                    },
                  },
                  signature: {
                    type: "object",
                    properties: {
                      sig: {
                        type: "string",
                        format: "signature",
                        description: "Transaction signature",
                        example:
                          "t9FHIieYGRH74Ox/jaf7Yjy2RqJZ7/0sV6ArfN1HVJ3z035CvKZNWaUqIVbT+K4/Opra5Him6zOqv2OhyILrCA==",
                      },
                    },
                  },
                  "genesis-hash": {
                    type: "string",
                    format: "hash",
                    description: "First block on the chain",
                    example: "jwew/Hb8y3ekTKRAL0aRePuaqNEYunPsB55c210piUg=",
                  },
                },
              },
            ],
          },
        },
      },
      "token-asset": {
        type: "object",
        properties: {
          amount: {
            type: "number",
            format: "double",
            description: "Asset balance",
            example: 25.6,
          },
          "asset-id": {
            type: "integer",
            format: "int32",
            description: "Asset / token global identifier",
            example: 1,
          },
          "asset-name": {
            type: "string",
            format: "string",
            description: "Asset / token name",
            example: "Fidelis Trust",
          },
          unitName: {
            type: "string",
            format: "string",
            description: "Asset / token unit name",
            example: "FTT",
          },
          "is-frozen": {
            type: "boolean",
            format: "-",
            description: "Asset / token status",
            example: false,
          },
        },
      },
      "contract-object": {
        type: "object",
        description: "Contract state object",
        properties: {
          contract_id: {
            type: "string",
            format: "string",
            description:
              "Contract Id, is a reference to the smart contract the user wants to effect payment on",
            example: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          },
          start_date: {
            type: "Date",
            format: "DateTime Object",
            description: "Loan Start Date",
            example: "11/11/2021",
          },
          end_date: {
            type: "Date",
            format: "DateTime Object",
            description: "Loan End Date",
            example: "11/11/2022",
          },
          loan_amount: {
            type: "integer",
            format: "int32",
            description: "loan payment amount",
            example: 1,
          },
          interest_rate: {
            type: "integer",
            format: "int32",
            description:
              "Percentage Loan interest rate must be between 0 and 100",
            example: 3,
          },
          receiver_address: {
            type: "String",
            format: "string",
            description: "loan reciever wallet address",
            example: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          },
          receiver_staked_points: {
            type: "double",
            format: "double",
            description:
              "loan reciever points / tokens staked against the loan",
            example: 25.6,
          },
          receiver_earned_points: {
            type: "double",
            format: "double",
            description: "loan reciever points / tokens earned",
            example: 25.6,
          },
          amount_payed: {
            type: "number",
            format: "double",
            description: "Loan Amount payed",
            example: 25.6,
          },
          backers: {
            type: "array",
            format: "-",
            description: "List of backers and backed points",
            items: {
              $ref: "#/components/schemas/backer-object",
            },
          },
          balance: {
            type: "double",
            format: "double",
            description: "Loan Balance",
            example: 1.2,
          },
          hasDefaulted: {
            type: "boolean",
            format: "boolean",
            description:
              "Loan default state, true if loan has been defaulted, else false",
            example: false,
          },
          hasCompleted: {
            type: "boolean",
            format: "boolean",
            description:
              "Loan completion state, true is loana has been successfully repayed, else false",
            example: false,
          },
        },
      },
      "backer-object": {
        type: "object",
        properties: {
          points: {
            type: "double",
            format: "double",
            description: "staked points / tokens",
            example: 2.5,
          },
          address: {
            type: "String",
            format: "String",
            description: "Backer wallet address",
            example: "mnabdivy90qonausfyfdt6a",
          },
          earned: {
            type: "double",
            format: "double",
            description: "earned points / tokens",
            example: 2.5,
          },
        },
      },
      "contract-creation-object": {
        type: "object",
        properties: {
          receiver_address: {
            type: "string",
            description: "loan reciever wallet address",
            example: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          },
          receiver_staked_points: {
            type: "number",
            description: "loan reciever points staked against the loan",
            example: "25",
          },
          loan_amount: {
            type: "number",
            description: "loan amount",
            example: "25",
          },
          interest_rate: {
            type: "number",
            description:
              "Percentage Loan interest rate must be between 0 and 100",
            example: "3",
          },
          agent_address: {
            type: "string",
            description: "agent_address",
            example: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          },
          start_date: {
            type: "Date",
            description: "Valid DateTime object, when the loan starts",
            example: "11/11/2021",
          },
          end_date: {
            type: "Date",
            description: "Valid DateTime object, when the loan ends",
            example: "11/11/2022",
          },
          backers: {
            type: "array",
            format: "-",
            description: "List of backers and backed points",
            items: {
              $ref: "#/components/schemas/backer-object",
            },
          },
        },
      },
    },
    "@parameters": {
      uniqueIdentifier: {
        type: "string",
        format: "identifier",
        description: "An identifier for the user, this cannot be changed",
        required: true,
      },
    },
  },
};

const outputFile = "./docs/UI/apidocs.json";
const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
// swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
//     require('./app.js');
//   });