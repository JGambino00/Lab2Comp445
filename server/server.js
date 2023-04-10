const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
require('dotenv').config();
const {Blob} = require('buffer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: '445lab2'
})


app.use(express.json({limit: '170mb'}));

app.use(cors());

app.use(cors({
    origin: "http://localhost:3000",
  }));
  
  // Allow cross-origin requests with specific methods and headers
  app.use(cors({
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  }));
  
  // Allow cross-origin requests with credentials (e.g., cookies)
  app.use(cors({
    credentials: true,
  }));

app.post('/acknowledge', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
 
    //res.json({message: 'Request received'});
    
    let query = 'INSERT INTO videoSegments (name, data) VALUES (?, ?)';

    const jsonString = JSON.stringify(req.body['data']);
    
    // Step 2: encode the string using UTF-8
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);

    // Step 3: create a Uint8Array from the byte sequence
    const uint8Array = new Uint8Array(bytes);
    //console.log(uint8Array);
    
    
    //let blobToInsert = new Blob(uint8Array, {type : 'video/mp4'});
    
    let bufferToInsert = Buffer.from(uint8Array);
    
      connection.query(query, [req.body['name'], bufferToInsert], (error, results, fields) => {
        try{
          //if(error) throw error;
          if(error){
            throw error.code;
          } 
          console.log('Data inserted succesfully');

        } catch(error){       
          if(error == 'ER_DUP_ENTRY'){
            //Do nothing
          }
        }
          
      })

    let jsonObject = JSON.parse(jsonString);
    //console.log(jsonObject);
    let jsonArr = Object.keys(jsonObject);
    //console.log(jsonArr.length);
    res.send({ackNumber : req.body['seqNum'] + jsonArr.length});
});

// Start the server
app.listen(8080, () => {
  console.log('Server started on port 8080');
});