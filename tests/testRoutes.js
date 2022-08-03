const express = require("express");
const router = express.Router();
const FidelisContracts = require('../utils/fidelisClient');

let fidelisContracts = new FidelisContracts();




router.post('/deploy',(req, res)=>{

    let params  = req.body;
    fidelisContracts.deploy(params).then((data) => {
      console.log(data);

      res.send(data);
    });
 });

 router.post('/initiation',(req, res)=>{

  let params  = req.body;
  fidelisContracts.initiationFlow(params).then((data) => {
    console.log(data);

    res.send(data);
  });
});


 module.exports = router;