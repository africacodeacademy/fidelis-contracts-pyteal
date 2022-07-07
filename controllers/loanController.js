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
              "schema":  {$ref:'#/components/schemas/contract-creation-object'}
                
            }
        }        
    }
    #swagger.responses[200] = {
        description: 'contract state object',
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

    return res.send({
      contract_id: "hgs568i2yyrr6yfa8s7dfavysdtf86",
      start_date: new Date(),
      end_date: new Date(),
      loan_amount: 300,
      interest_rate: 3,
      amount_payed: 0,
      receiver_address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
      receiver_staked_points: 25.6,
      receiver_earned_points: 30,
      backers: [
        {
          address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          points: 25,
          earned: 0,
        },
      ],
      balance: 300,
      hasDefaulted: false,
      hasCompleted: false,
    });
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
        description: 'Contract state object',
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
      receiver_earned_points: 30,
      backers: [
        {
          address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
          points: 25,
          earned: 30,
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
