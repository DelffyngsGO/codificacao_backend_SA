const key = require('../data/keyBoard.js')

const getAll = () => key

const getById = (id) => key.find(m => m.id === parseInt(id))

module.exports = { getAll, getById }