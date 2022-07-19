const express = require("express");
const router = express.Router();
const deploy = require('../utils/deploy');


router.post('/initiate',(req, res)=>{

    let params  = req.body;
        deploy.initialize(params).then((data)=>{
        res.json(data);
    })
 });


 module.exports = router;