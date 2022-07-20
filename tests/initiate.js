
const deploy = require('../utils/deploy');


let params = {
    "receiver_address": "hgs568i2yyrr6yfa8s7dfavysdtf86",
    "receiver_staked_points": "25",
    "loan_amount": "50",
    "interest_rate": "1",
    "agent_address": "hgs568i2yyrr6yfa8s7dfavysdtf86",
    "start_date": "123434532",
    "end_date": "32342342",
    "backers": [
        {
        "points": 2.5,
        "address": "mnabdivy90qonausfyfdt6a",
        "earned": 2.5
        },

        {
        "points": 2.5,
        "address": "mnabdivy90qonausfyfdt6a",
        "earned": 2.5
        }
    ]
}

deploy.initialize(params).then((data)=>{
    console.log(data);
});
