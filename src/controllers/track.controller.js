const Track = require('../models/track.model');

const list = async (req, res) => {
    try {
        const response = await Track.find({spotify_uri: {$ne: null}}).exec();
        res.json(response);
    }
    catch (error) {
        res.send(error);
    }


};

// // retrieve a specific user using the user id (in our case, the user from the jwt)
// const get = (req, res) => {
//     const data = Object.assign(req.body, { track: req.track.sub }) || {};
//
//     Track.findById(data.track)
//         .then(track => {
//             track.password = undefined;
//             track.recoveryCode = undefined;
//
//             res.json(track);
//         })
//         .catch(err => {
//             res.status(422).send(err.errors);
//         });
// };
//
// // update a specific user
// const put = (req, res) => {
//     const data = Object.assign(req.body, { user: req.user.sub }) || {};
//
//     if (data.email && !validator.isEmail(data.email)) {
//         return res.status(422).send('Invalid email address.');
//     }
//
//     if (data.username && !validator.isAlphanumeric(data.username)) {
//         return res.status(422).send('Usernames must be alphanumeric.');
//     }
//
//     Track.findByIdAndUpdate({ _id: data.user }, data, { new: true })
//         .then(user => {
//             if (!user) {
//                 return res.sendStatus(404);
//             }
//
//             user.password = undefined;
//             user.recoveryCode = undefined;
//
//             res.json(user);
//         })
//         .catch(err => {
//             logger.error(err);
//             res.status(422).send(err.errors);
//         });
// };
//
// // create a user
// const post = (req, res) => {
//     const data = Object.assign({}, req.body, { user: req.user.sub }) || {};
//
//     Track.create(data)
//         .then(user => {
//             res.json(user);
//         })
//         .catch(err => {
//             logger.error(err);
//             res.status(500).send(err);
//         });
// };
//
//
// // remove a user record (in our case, set the active flag to false to preserve data)
// const remove = (req, res) => {
//     Track.findByIdAndUpdate(
//         { _id: req.params.user },
//         { active: false },
//         {
//             new: true,
//         },
//     )
//         .then(user => {
//             if (!user) {
//                 return res.sendStatus(404);
//             }
//
//             res.sendStatus(204);
//         })
//         .catch(err => {
//             logger.error(err);
//             res.status(422).send(err.errors);
//         });
// };

module.exports = {
    list
};