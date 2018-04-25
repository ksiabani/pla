'use strict';

const svc = require('../services');

const getTaxRate = (req, res) => {
    const state = req.params.stateName;
    svc.scrapeTaxRates(state, stateUrls[state.toLowerCase()], (rates) => {
        const rate = rates.find(rate => {
            return rate.city.toLowerCase() === req.params.cityName.toLowerCase();
        });
        res.send(rate);
    });
};

const calculateTaxes = (req, res) => {
    const state = req.params.stateName;
    svc.scrapeTaxRates(state, stateUrls[state.toLowerCase()], (rates) => {
        const rate = rates.find(rate => {
            return rate.city.toLowerCase() === req.params.cityName.toLowerCase();
        });
        res.send(rate.calculateTax(parseFloat(req.params.amount)));
    });
};

const getTracks = (req, res) => {
    const genre = req.params.genre;
    const category = req.params.category;
    const url = urls.traxsource[genre][category];
    svc.scrapeTracks(url, () => {
        res.send(url);
    });
};

const urls = {
    traxsource: {
        house: {
            latest: "https://www.traxsource.com/genre/4/house/all?cn=titles&ipp=10&period=today",
            popular: "https://www.traxsource.com/genre/4/house/top"
        },
        "soulful-house": {
            latest: "",
            popular: ""
        }
    }
};

const stateUrls = {
    nebraska: 'http://www.revenue.nebraska.gov/question/sales.html'
};

module.exports = {
    getTaxRate,
    calculateTaxes,
    stateUrls,
    getTracks
};