const mongoose = require('mongoose');

const Role = {
   ADMIN: 'ADMIN',
   USER: 'USER'
}

const userSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   username: { type: String, required: true, match: /^[a-zA-Z][a-zA-Z0-9]{3,}$/ },
   firstName: { type: String, required: true, match: /^[A-Z][a-z]{2,}$/ },
   lastName: { type: String, required: true, match: /^[A-Z][a-z]{2,}$/ },
   email: { type: String, required: true, unique: true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
   password: { type: String, required: true},
   imageUrl: { type: String, required: true, default: 'https://www.bootdey.com/app/webroot/img/Content/avatar/avatar1.png' },
   phoneNumber: { type: String, required: true ,
                  match: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/ },
   role: { type: String, required: true, default: Role.USER }
});

module.exports = mongoose.model('User', userSchema);