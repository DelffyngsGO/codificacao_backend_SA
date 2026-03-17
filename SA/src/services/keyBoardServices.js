const kb = require('../data/keyBoard.js')

// Retorna todas as teclas agrupadas por categoria
const getAll = () => kb

// Retorna todas as teclas em um array flat
const getAllFlat = () => [
    ...kb.letters,
    ...kb.numbers,
    ...kb.specials
]

// Busca por ID
const getById = (id) =>
    getAllFlat().find(k => k.id === parseInt(id))

// Busca por nome ou símbolo (ex: 'A', 'a', ',')
const getByName = (name) =>
    getAllFlat().find(
        k => k.name.toLowerCase() === name.toLowerCase() ||
             k.alter === name.toLowerCase()
    )

// Retorna apenas uma categoria
const getByCategory = (category) => kb[category] ?? null

module.exports = { getAll, getAllFlat, getById, getByName, getByCategory }