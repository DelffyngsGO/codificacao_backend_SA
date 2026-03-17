const express = require('express')
const router = express.Router()
const keyBoardServices = require('../services/keyBoardServices.js')

// GET /kb → todas as teclas agrupadas por categoria
router.get('/', (req, res) => {
    res.json(keyBoardServices.getAll())
})

// GET /kb/all → todas as teclas em lista flat
router.get('/all', (req, res) => {
    res.json(keyBoardServices.getAllFlat())
})

// GET /kb/category/:category → ex: /kb/category/letters
router.get('/category/:category', (req, res) => {
    const result = keyBoardServices.getByCategory(req.params.category)
    if (!result)
        return res.status(404).json({ message: 'Categoria não encontrada. Use: letters, numbers ou specials' })
    res.json(result)
})

// GET /kb/name/:name → ex: /kb/name/A ou /kb/name/,
router.get('/name/:name', (req, res) => {
    const key = keyBoardServices.getByName(req.params.name)
    if (!key)
        return res.status(404).json({ message: 'Tecla não encontrada' })
    res.json(key)
})

// GET /kb/:id → ex: /kb/1
router.get('/:id', (req, res) => {
    if (isNaN(req.params.id))
        return res.status(400).json({ message: 'O ID deve ser um número' })
    const key = keyBoardServices.getById(req.params.id)
    if (!key)
        return res.status(404).json({ message: 'Tecla não encontrada' })
    res.json(key)
})

module.exports = router