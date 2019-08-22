const mongoose = require('mongoose')

mongoose.Promise = global.Promise
//mongoose.connect('mongodb://root:MongoDB2019!@mongo:27017/alfa',{ useNewUrlParser: true })
mongoose.connect('mongodb://mongo:27017/alfa',{ useNewUrlParser: true })

module.exports = mongoose
