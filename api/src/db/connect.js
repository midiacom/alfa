const mongoose = require('mongoose')

/* istanbul ignore next */ 
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true}).then(() => {
    // console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
});

module.exports = mongoose
