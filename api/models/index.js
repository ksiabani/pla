'use strict';

// class TaxRate {
//     constructor(state, city, localRate, stateRate) {
//         this.state = state;
//         this.city = city;
//         this.localRate = localRate;
//         this.stateRate = stateRate;
//     }
//
//     calculateTax (subTotal) {
//         const localTax = this.localRate * subTotal;
//         const stateTax = this.stateRate * subTotal;
//         const total = subTotal + localTax + stateTax;
//         return {
//             localTax,
//             stateTax,
//             total
//         };
//     }
// }

class Track {
    constructor(title, artist, album) {
        this.title = title;
        this.artist = artist;
        this.album = album;
    }
}

class Album {
    constructor(title, artist) {
        this.title = title;
        this.artist = artist;
    }
}

module.exports = {
    Track,
    Album
};