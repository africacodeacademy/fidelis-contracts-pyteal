/**
 * initialize a loan
 */
exports.createLoan = async (req, res, next) => {
  /**
     * #swagger.tags = ['Loan']
     * #swagger.summary = 'Create'
     * #swagger.description = 'Endpoint creates a smart contract loan, checks loan requirement 
     * conditions and deployes a smart contract on the algorand block chain, returns tthe smart 
     * contract address'
    #swagger.requestBody {
        required: true,
        "@content": { 
            "application/json": {
              "schema": {
                    type: "object",
                    properties: {
                        receiver_address: {
                            type: "string",
                            description: 'loan reciever wallet address',
                            example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                        },
                        receiver_staked_points: {
                            type: "number",
                            description: 'loan reciever points staked again the loan',
                            example:"25"
                        },
                        loan_amount: {
                            type: "number",
                            description: 'loan amount',
                            example:"25"
                        },
                        interest_rate: {
                            type: "number",
                            description: 'Percentage Loan interest rate must be between 0 and 100',
                            example:"3"
                        },
                        agent_address: {
                            type: "string",
                            description: 'agent_address',
                            example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                        },
                        start_date: {
                            type: "Date",
                            description: 'Valid DateTime object, when the loan starts',
                        },
                        end_date: {
                            type: "Date",
                            description: 'Valid DateTime object, when the loan ends'
                        },
                        backers: {
                            type: "object",
                            description: 'List of backer address and respective staked backer points',
                            properties:{
                                address: {
                                    type: "string",
                                    description: 'backer wallet address',
                                    example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                                },
                                points: {
                                    type: "number",
                                    description: 'backer staked points',
                                    example:"25"
                                },
                            }
                        },                   
                                       
                    },
                    required: ["receiver_address","receiver_staked_points", "loan_amount", "agent_address", "start_date", "end_date", "backers"]
                }
            }
        }        
    }
    #swagger.responses[200] = {
        description: '',
        schema: {$ref:'#/components/schemas/contract-object'}
    }  
     */
  try {
    const {
      receiver_address,
      receiver_staked_points,
      backers,
      agent_address,
      loan_amount,
      start_date,
      end_date,
    } = req.body;

    return res.send({ contract_id: "hgs568i2yyrr6yfa8s7dfavysdtf86" });
  } catch (err) {
    err = errorUtils.errorParser(err);
    res.status(400).send(err);
    // return next(err)
  }
};

/**
 * initialize a loan
 */
exports.payment = async (req, res, next) => {
  /**
     * #swagger.tags = ['Loan']
     * #swagger.summary = 'Payment'
     * #swagger.description = 'Endpoint facilitates loan repayment'
    #swagger.requestBody {
        required: true,
        "@content": { 
            "application/json": {
              "schema": {
                    type: "object",
                    properties: {
                        contract_id: {
                            type: "string",
                            description: 'Contract Id, is a reference to the smart contract the user wants to effect payment on',
                            example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                        },
                        amount: {
                            type: "number",
                            description: 'loan payment amount',
                            example:"25"
                        },
                        agent_address: {
                            type: "string",
                            description: 'agent_address',
                            example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                        }           
                    },
                    required: ["contract_id", "amount", "agent_address"]
                }
            }
        }        
    }
    #swagger.responses[200] = {
        description: '',
        schema: {$ref:'#/components/schemas/contract-object'}
    }  
     */
  try {
    const { id, amount, agent_address } = req.body;

    let contract_state = {
      contract_id: "hgs568i2yyrr6yfa8s7dfavysdtf86",
      start_date: new Date(),
      end_date: new Date(),
      loan_amount: 300,
      interest_rate: 3,
      amount_payed: 0,
      receiver_address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
      receiver_staked_points: 25.6,
      backers: [
        {
          address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          points: 25,
        },
      ],
      balance: 300,
      hasDefaulted: false,
      hasCompleted: false,
    };
    return res.send(contract_state);
  } catch (err) {
    err = errorUtils.errorParser(err);
    res.status(400).send(err);
    // return next(err)
  }
};
