const express = require("express");
const router = express.Router();
const fidelisClient = require('../utils/fidelisClient');


router.post('/initiate',(req, res)=>{

    let params  = req.body;
    fidelisClient.deploy(params).then((data)=>{
        res.json(data);
    })
 });


 module.exports = router;