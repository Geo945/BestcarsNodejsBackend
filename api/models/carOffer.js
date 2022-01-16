const mongoose = require('mongoose');

const carOfferSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: { type: String, required: true },
    fabricationYear: { type: Number, required: true },
    mileage: { type: Number, required: true },
    fuelType: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    //ManyToOne so I need personId
    personId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    approved: { type: Boolean, default: false }
});

module.exports = mongoose.model('CarOffer', carOfferSchema);