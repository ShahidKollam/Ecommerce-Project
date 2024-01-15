const express = require('express');
const noCache = require('nocache')
const path = require('path');
const dotenv = require('dotenv').config();
const app = express();

const PORT = 8080;
  
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter') 
const dbConnect = require('./config/dbConnect');
dbConnect()
   
app.use(express.static("public"))
app.use('/static',express.static(path.join(__dirname, 'public/assets/corporate/css')));
app.use('/static',express.static(path.join(__dirname, 'public/admin-asset/css')));
app.use('/static',express.static(path.join(__dirname, 'public/product-images')));

app.use(noCache())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/',userRouter) 
app.use('/',adminRouter)  

app.listen( PORT,()=>{ console.log(`Server is running http://localhost:${PORT}/`) } ) 

