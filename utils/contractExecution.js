const { exec } = require("child_process");

const OPERATIONS = require("../constants/operations")


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
        this.command = "node --version"; // Think of a better default
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
        return "ls -la";
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


let executer = new Executer("Olebogeng", OPERATIONS.INIT_LOAN);

executer.execute();
