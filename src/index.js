const express = require('express');
const app = express();
const apiRoutes  = require('./routes/index');
const bodyParser = require('body-parser');
const {PORT} = require('./config/serverConfig');
const db = require('./models/index');
const {createChannel} = require('./utils/messageQueue');

 setupServer=async()=>{
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    const channel = await createChannel();

    app.use((req, res, next) => {
        req.channel = channel;
        next();
    });
    app.use('/api',apiRoutes);

   app.listen(PORT,()=>{
    console.log("Server started on",PORT);
   });
  //  if(process.env.DB_SYNC){
  //   db.sequelize.sync({alter:true});
  //  }
 }
 setupServer();