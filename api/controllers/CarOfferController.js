const CarOffer = require('../models/carOffer');
const mongoose = require('mongoose');
const fs = require("fs");

exports.getAllOffers = (req, res, next) => {
    CarOffer.find()
        .select('_id title fabricationYear mileage fuelType city price images personId approved')
        .exec()
        .then((offers) => {
            if ( offers.length > 0 ){
                res.status(200).json({
                    count: offers.length,
                    offers: offers.map((offer) => {
                        return {
                            _id: offer._id,
                            title: offer.title,
                            fabricationYear: offer.fabricationYear,
                            mileage: offer.mileage,
                            fuelType: offer.fuelType,
                            city: offer.city,
                            price: offer.price,
                            images: offer.images,
                            personId: offer.personId,
                            approved: offer.approved
                        }
                    })
                })
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
        });
};

exports.addCar = (req, res, next) => {

    //check if string fields are numbers
    if ( !isNaN(req.body.title)){
        return res.status(500).json({
            message: 'Title should not be a number!'
        })
    }

    if ( !isNaN(req.body.fuelType)){
        return res.status(500).json({
            message: 'Fuel type should not be a number!'
        })
    }

    if ( !isNaN(req.body.city)){
        return res.status(500).json({
            message: 'City should not be a number!'
        })
    }

    if ( req.files.length < 1){
        return res.status(500).json({
            message: 'No images provided'
        })
    }

    //extract offer images
    const offerImages = [];
    for(const file of req.files)
        offerImages.push(file.path);

    const carOffer = new CarOffer({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        fabricationYear: req.body.fabricationYear,
        mileage: req.body.mileage,
        fuelType: req.body.fuelType,
        city: req.body.city,
        price: req.body.price,
        images: offerImages,
        personId: req.userData.personId,
    });

    carOffer.save()
        .then((response) => {
            res.status(200).json({
                message: 'Offer created',
                createdOffer: {
                    _id: response._id,
                    title: response.title,
                    fabricationYear: response.fabricationYear,
                    mileage: response.mileage,
                    fuelType: response.fuelType,
                    city: response.city,
                    price: response.price,
                    images: response.images,
                    personId: response.personId,
                    approved: response.approved
                }
            });
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        });
};

exports.approveAd = (req, res, next) => {
    CarOffer.findOne({_id: req.params.offerId})
        .exec()
        .then((response) => {
            if ( response === null){
                return res.status(404).json({
                    message: 'No entries found'
                })
            } else {
                CarOffer.updateOne({ _id: req.params.offerId }, { $set: { approved: true } })
                    .exec()
                    .then((response) => {
                        return res.status(200).json({
                            message: 'Offer approved'
                        });
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            error: error
                        })
                    });
            }
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        });
};

exports.deleteAd = (req, res, next) => {
    CarOffer.findOne({ _id: req.params.offerId })
        .exec()
        .then((offer) => {
            if ( offer === null){
                return res.status(404).json({
                    message: 'No entries found'
                })
            } else {

                CarOffer.remove({ _id: req.params.offerId })
                    .exec()
                    .then((response) => {
                        if(offer.images.length > 0){
                            for(const img of offer.images){
                                fs.unlink(img, (err) => {
                                    if (err){
                                        console.log('No files found');
                                    }
                                });
                            }
                        }
                        return res.status(200).json({
                            message: 'Car offer deleted!'
                        });
                    })
                    .catch((error) => {
                        res.status(500).json({
                            error: error
                        })
                    });
            }
        })
        .catch((error) => {
            res.status(500).json({
                error: error
            })
        });

};
