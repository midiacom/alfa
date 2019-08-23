const locationModel = require("../models/locationModel")

const locationRoutes = {
    list: (req, res, next) => {
        
        const query = req.query || {};

        locationModel.find(query)
            .select('name')
            .then(locations => {
                console.log("ddddddddddddd");
                //res.status(201).json(locations);
            })
            .catch(err => {
                console.log(err);
                res.status(422).send(err.errors);
            });        
    },

    get: (req, res, next) => {
        res.status(201).send(`Requisição recebida com sucesso! ${id}`);
    },
    
    post: (req, res, next) => {

        const location = new locationModel({
            name: req.body.name,
            description: req.body.description
        })                
        
        location.save((err,location) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating location',
                    error: err
                });
            }
    
            // res.status(201).send('Requisição recebida com sucesso!')

            return res.status(201).json(location);
        })

    },
    
    put: (req, res, next) => {
        let id = req.params.id;
        res.status(201).send(`Requisição recebida com sucesso! ${id}`);
    },
    
    delete: (req, res, next) => {
        let id = req.params.id;
        res.status(200).send(`Requisição recebida com sucesso! ${id}`);
    },

}    
module.exports = locationRoutes