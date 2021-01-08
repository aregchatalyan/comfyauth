const fs = require('fs');
const path = require('path');
const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
    destination(req, file, done) {
        if (!fs.existsSync(`uploads/${req.user.id}/`)) {
            fs.mkdirSync(`uploads/${req.user.id}/`);
        }
        done(null, `uploads/${req.user.id}/`);
    },

    filename(req, file, done) {
        done(null, file.fieldname + '-' + moment().format('DD.MM.YYYY-HH.mm.ss.SSS') + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, done) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        done(null, true);
    } else {
        done(null, false);
    }
};

const limits = {fileSize: 1024 * 1024 * 5};

module.exports = multer({storage, fileFilter, limits});
