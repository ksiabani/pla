module.exports = function sleepRand(min, max) {
    return new Promise(resolve => {
        const rand = Math.random() * (max - min) + min;
        setTimeout(resolve, rand * 1000);
    })
};