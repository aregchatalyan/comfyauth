module.exports = (res, err) => {
    res.status(500).json({message: err.message ? err.message : err})
};
