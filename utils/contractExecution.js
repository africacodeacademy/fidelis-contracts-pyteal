const { exec } = require("child_process");

const OPERATIONS = require("../constants/operations")

let algo_base = process.env.ALGO_NODE_BASE_DIR;


class Executer{

    /**
     * 
     * @param {*} params is an array of the parameters from the backend
     * @param {*} operation is one of the operations defined in constants
     */
    constructor(params, operation)
    {
        this.params = params;
        this.operation = operation
        this.command = this.getCommand();
    }

    getCommand()
    {
        this.command = "echo $USER"; // Think of a better default
        switch(this.operation)
        {
            case OPERATIONS.INIT_LOAN:
                this.command = this.buildLoanInit();
                break;

            default:
                break;
        }

        return this.command;
    }

    buildLoanInit()
    {
        return `cd ${algo_base} && \
         ls -la`;
    }

    execute()
    {
        exec(this.command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
            console.log(`stdout: ${stdout}`);
        });
    }

};



let data = {
    receiver_address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
    receiver_staked_points: "25",
    loan_amount: "25",
    interest_rate: "3",
    agent_address: "hgs568i2yyrr6yfa8s7dfavysdtf86",
    start_date: "11/11/2021",
    end_date: "11/11/2022",
    backers: [
        {
        "points": 2.5,
        "address": "mnabdivy90qonausfyfdt6a",
        "earned": 2.5
        }
        ]
    }
let executer = new Executer(data, OPERATIONS.INIT_LOAN);

executer.execute();
