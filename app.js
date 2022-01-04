const express = require('express');
// let cors = require("cors");
const app = express();
app.set('trust proxy', 1);
app.use(express.json());

app.use('/users', require('./routes/Users'));
app.use('/orders', require('./routes/Orders'))
app.use('/items', require('./routes/Items'))
app.get('/',(req,res)=>{
    res.status(200).json({'msg':'Keeb Server'});
})
app.listen({ port: 8080 }, async () => {
    console.log('Server up on http://localhost:8080')
    console.log('Connected!')
});
