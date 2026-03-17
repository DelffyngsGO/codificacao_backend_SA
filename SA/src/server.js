const express = require('express')
const app = express()

const kBRoute = require('./routes/keyBoardRoutes.js')

app.use(express.json())

const port = 3000

app.get('/', (req, res) => {
    res.send('Sem conteúdo nesta página')
})

app.use('/kb', kBRoute)

app.listen(port, () => {
    console.log(`O servidor está rodando na porta: ${port}`)
})