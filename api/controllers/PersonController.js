const User = require('../models/person');
const CarOffer = require('../models/carOffer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');

//nodemailer config
const transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: process.env.user,
        pass: process.env.pass
    },
}));


exports.getAllUsers = (req, res, next) => {
    User.find()
        .select('_id username firstName lastName email imageUrl phoneNumber role')
        .exec()
        .then((users) => {
            if ( users.length > 0) {
                const metaData = {
                    count: users.length,
                    users: users.map((user) => {
                        return {
                            _id: user._id,
                            username: user.username,
                            firstname: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            imageUrl: user.imageUrl,
                            phoneNumber: user.phoneNumber,
                            role: user.role
                        }
                    })
                };
                res.status(200).json(metaData);
            } else {
                res.status(404).json({
                    message: 'No entries found!'
                })
            }
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        })
};

exports.addPerson = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then((person) => {
            if ( !/[a-zA-Z0-9!@#$%^&*]{8,30}/.test(req.body.password)){
                return res.status(409).json({
                    message: 'Invalid password'
                });
            }else if ( person.length >=1 ){
                return res.status(409).json({
                    message: 'Mail exists!'
                });
            } else {
                bcrypt.hash( req.body.password, 10, (err, hashedPassword) => {
                    if (err){
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        //create user to save
                        const user = new User({
                            _id: new  mongoose.Types.ObjectId(),
                            username: req.body.username,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: hashedPassword,
                            phoneNumber: req.body.phoneNumber
                        });
                        //save user
                        user.save()
                            .then((response) => {
                                const mailOptions = {
                                    from: process.env.user,
                                    to: req.body.email,
                                    subject: 'Bestcars registration',
                                    text: 'Hello ' + req.body.username + ",\n\nWelcome to bestcars !"
                                }

                                transporter.sendMail( mailOptions, (error, info) => {
                                    if (error){
                                        res.status(200).json({
                                            message: 'User created!',
                                            errors: {
                                              error: error,
                                              message: 'Failed to send registration mail'
                                            },
                                            createdUser: {
                                                _id: response._id,
                                                username: response.username,
                                                firstName: response.firstName,
                                                lastName: response.lastName,
                                                email: response.email,
                                                imageUrl: response.imageUrl,
                                                phoneNumber: response.phoneNumber
                                            }

                                        });
                                    } else {
                                        res.status(200).json({
                                            message: 'User created!',
                                            createdUser: {
                                                _id: response._id,
                                                username: response.username,
                                                firstName: response.firstName,
                                                lastName: response.lastName,
                                                email: response.email,
                                                imageUrl: response.imageUrl,
                                                phoneNumber: response.phoneNumber
                                            }
                                        });
                                    }
                                });


                            })
                            .catch((error) => {
                                res.status(500).json({
                                    error: error
                                })
                            })
                    }
                })
            }
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        });

};

exports.updatePerson = (req, res, next) => {
    User.updateOne( { _id: req.params.personId }, { $set: req.toUpdate })
        .exec()
        .then((response) => {
            if ( response.modifiedCount > 0) {
                res.status(200).json({
                    message: 'User updated!'
                })
            } else {
                res.status(404).json({
                    message: 'No entries found'
                })
            }
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        });
};

exports.updatePersonPassword = (req, res, next) => {
    if ( /[a-zA-Z0-9!@#$%^&*]{8,30}/.test(req.body.password) ){
        bcrypt.hash( req.body.password, 10, (err, hashedPassword) => {
            if (err){
                return res.status(500).json({
                    error: err
                });
            } else {
                User.updateOne( { _id: req.params.personId }, { $set: { password: hashedPassword } })
                    .exec()
                    .then((response) => {
                        if ( response.modifiedCount === 1) {
                            res.status(200).json({
                                message: 'User updated!'
                            })
                        } else {
                            res.status(404).json({
                                message: 'No entries found'
                            })
                        }
                    })
                    .catch((error) => {
                        res.status(500).json({
                            error: error
                        })
                    });
            }
        });
    } else {
        res.status(500).json({
           message: 'Validation error'
        });
    }
}


exports.deletePerson = (req, res, next) => {
    User.findOneAndRemove({ _id: req.params.personId })
        .exec()
        .then((response) => {
            if( response === null ){
                res.status(404).json({
                    message: 'Could not delete user'
                });
            } else {
                CarOffer.remove({ personId: req.params.personId })
                    .exec()
                    .then((response) => {
                        return res.status(200).json({
                            message: 'User deleted!'
                        });
                    })
                    .catch((error) => {
                        res.status(500).json({
                            error: error
                        })
                    })
            }
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        })
};

exports.loginPerson = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then((user) => {
            if ( user.length < 1 ){
                //code 401 - means unauthorized
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
               if (err){
                   return res.status(401).json({
                       message: 'Auth failed'
                   });
               }
               if (result) {
                   //if the passwords match then create token
                    const token = jwt.sign(
                        {
                            personId: user[0]._id,
                            username: user[0].username,
                            firstName: user[0].firstName,
                            lastName: user[0].lastName,
                            email: user[0].email,
                            imageUrl: user[0].imageUrl,
                            phoneNumber: user[0].phoneNumber,
                            role: user[0].role
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    //send response with token included
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
               }

               return res.status(401).json({
                   message: 'Auth failed'
               });
            });
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        });
};
