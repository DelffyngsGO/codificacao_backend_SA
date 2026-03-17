const express = require('express')
const router = express.Router()
const keyBoardServices = require('../services/keyBoardServices.js')

router.get('/', (req, res) => {
    res.json(keyBoardServices.getAll())
})

router.get('/:id', (req, res) => {
    const key = keyBoardServices.getById(req.params.id)
    if (!key)
        return res.status(404).json({ message: 'Tecla não encontrada' })
    res.json(key)
})

module.exports = router