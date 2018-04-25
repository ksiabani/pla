'use strict';

const taxCtrl = require('../controllers');

module.exports = (app) => {
    app.use([
        '/calculate/:stateName/:cityName/:amount',
        '/taxrate/:stateName/:cityName',
        'traxsource/:genre/:category'
    ], (req, res, next) => {
        const state = req.params.stateName;
        const genre = req.params.genre;
        const category = req.params.category;
    if (!taxCtrl.stateUrls.hasOwnProperty(state.toLowerCase())) {
        res.status(404)
            .send({message: `No state info found for ${state}`});
    } else {
        next();
    }
});

    app.route('/taxrate/:stateName/:cityName')
        .get(taxCtrl.getTaxRate);

    app.route('/calculate/:stateName/:cityName/:amount')
        .get(taxCtrl.calculateTaxes);

    app.route('/traxsource/:genre/:category')
        .get(taxCtrl.getTracks);

    app.use((req, res) => {
        res.status(404)
        .send({url: `sorry friend, but url ${req.originalUrl} is not found`});
});
};

// Routes (traxsource)- new releases and top tracks:
// Tech house - New releases: traxsource/tech-house/latest
// Soulful House - Top tracks: traxsource/soulful-house/popular

