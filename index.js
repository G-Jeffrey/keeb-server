const express = require('express')
const bodyParser = require('body-parser')
const { PrismaClient } = require('@prisma/client')
const port = process.env.PORT || 8080;
const prisma = new PrismaClient()
const app = express()
app.set('trust proxy', 1);
app.use(express.json());
app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/users', require('./routes/Users'));
app.use('/orders', require('./routes/Orders'))
app.use('/items', require('./routes/Items'))
app.get(`/api`, async (req, res) => {
  res.json({ up: true })
})
app.get('/',(req,res)=>{
  res.status(200).json({'msg':'Keeb Server'});
})
// const PORT = process.env.PORT || 3000
// const server = app.listen(PORT, () =>
//   console.log(
//     `🚀 Server ready at: http://localhost:${PORT}\n⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`,
//   ),
// )
app.listen({ port: port }, async () => {
  console.log(`Server up on http://localhost:${port}`)
  console.log('Connected!')
});
