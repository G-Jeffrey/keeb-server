const express = require('express');
const { PrismaClient } = require('@prisma/client');
const port = process.env.PORT || 8080;
const cors = require('cors');
const prisma = new PrismaClient();
const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.get('', (req,res)=>{
  res.status(200).json({'msg':'Toki Server'});
})
app.get(`/api`,  (req, res) => {
  res.json({'up':true});
})
app.use('/users', require('./routes/users'));
app.use('/orders', require('./routes/orders'))
app.use('/items', require('./routes/items'))

app.listen({ port: port }, async () => {
  console.log(`Server up on http://localhost:${port}`)
  console.log('Connected!')
});
