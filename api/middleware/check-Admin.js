const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify( token, process.env.JWT_KEY);
        if ( decoded.role !== 'ADMIN') {
            return res.status(401).json({
                message: 'Auth failed'
            });
        } else {
            req.userData = decoded;
            next();
        }
    } catch (e) {
        res.status(401).json({
            message: 'Auth failed'
        });
    }
}