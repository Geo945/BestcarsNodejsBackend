const bcrypt = require("bcrypt");

module.exports = (req, res, next) => {
    const toUpdate = {};
    for( const ops of req.body) {
        if (ops.propName === 'username'){
            if (/^[a-zA-Z][a-zA-Z0-9]{3,}$/.test(ops.value)) {
                toUpdate[ops.propName] = ops.value;
            } else {
                return res.status(500).json({
                    message: 'Validation error'
                });
            }
        }

        if (ops.propName === 'firstName' || ops.propName === 'lastName'){
            if (/^[A-Z][a-z]{2,}$/.test(ops.value)) {
                toUpdate[ops.propName] = ops.value;
            } else {
                return res.status(500).json({
                    message: 'Validation error'
                });
            }
        }

        if (ops.propName === 'email'){
            if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(ops.value)) {
                toUpdate[ops.propName] = ops.value;
            } else {
                return res.status(500).json({
                    message: 'Validation error'
                });
            }
        }

        if (ops.propName === 'phoneNumber'){
            if (/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/.test(ops.value)) {
                toUpdate[ops.propName] = ops.value;
            } else {
                return res.status(500).json({
                    message: 'Validation error'
                });
            }
        }

        if ( ops.propName === 'imageUrl'){
            toUpdate[ops.propName] = ops.value;
        }

    }

    req.toUpdate = toUpdate;
    next();
}