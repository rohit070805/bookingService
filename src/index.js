const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {PORT} = require('./config/serverConfig');
 setupServer=()=>{
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
   app.listen(PORT,()=>{
    console.log("Server started on",PORT);
   })
 }
 setupServer();