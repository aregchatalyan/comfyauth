const mongoose = require('mongoose');

const {mongoDB: {local, URI}} = require('./keys');

(async () => {
    try {
        await mongoose.connect(local, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log('MongoDb connected');
    } catch (e) {
        console.log(e);
    }
})();
