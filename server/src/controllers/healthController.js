const getHealth = (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is healthy' });
};

module.exports = { getHealth };
