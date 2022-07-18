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
        return `cd ../sandbox && ./sandbox goal app create \
        --creator "M4W7RNEGZXIUFTVVSTCTALUCDSVT3IZQY73GTXU4DCI4U2YHXR2JCR6WHA" \
        --approval-prog "approval.teal" \
        --clear-prog "clear.teal" \
        --foreign-asset "95615734" \
        --foreign-asset "95615934" \
        --app-arg "str:50" \
        --app-arg "str:1" \
        --app-arg "str:123434532" \
        --app-arg "str:32342342" \
        --app-account "XWR4JW3C4P5O4XSWTQTWG5LQHLYW66QKH3K2LWYEFQLCUHWGIGLVZUU6H4" \
        --app-account "7C5J5IK273NQ5R2LCHWIITBH7N6DLBG2WA4I3EPCDJ3LU72PIJXJHGQCX4" \
        --global-byteslices 12 \
        --global-ints 0 \
        --local-ints 0 \
        --local-byteslices 0`;
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
