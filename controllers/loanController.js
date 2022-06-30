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
                        reciever_address: {
                            type: "string",
                            description: 'loan reciever wallet address',
                            example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                        },
                        reciever_staked_points: {
                            type: "number",
                            description: 'loan reciever points staked again the loan',
                            example:"25"
                        },
                        loan_amount: {
                            type: "number",
                            description: 'loan amount',
                            example:"25"
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
                    required: ["reciever_address","reciever_staked_points", "loan_amount", "agent_address", "start_date", "end_date", "backers"]
                }
            }
        }        
    }
    #swagger.responses[200] = {
        description: '',
        schema: {
            type: "object",
            properties: {
                address: {
                    type: "string",
                    description: 'contract block chain address',
                    example:"hgs568i2yyrr6yfa8s7dfavysdtf86"
                },
            }
        }
    }  
     */
  try {
    const {
      reciever_address,
      reciever_staked_points,
      backers,
      agent_address,
      loan_amount,
      start_date,
      end_date,
    } = req.body;

    return res.send({ address: "hgs568i2yyrr6yfa8s7dfavysdtf86" });
  } catch (err) {
    err = errorUtils.errorParser(err);
    res.status(400).send(err);
    // return next(err)
  }
};
