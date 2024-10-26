const SanctionService = require('../services/sanctionsService');

// Get all sanctions
exports.getAllSanctions = async (req, res) => {
    try {
        const sanctions = await SanctionService.sanctionedIndividuals;
        res.json(sanctions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if a user is sanctioned
exports.checkSanctionedUser = async (req, res) => {
    const { firstName, lastName, dob, birthplace } = req.body; // Fields to check
    try {
        const sanctions = SanctionService.searchSanctions({ firstName, lastName, dob, birthplace });
        res.json({ sanctioned: sanctions.length > 0, individuals: sanctions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get sanction by ID (if you want to implement this, you would need to adjust your service)
exports.getSanctionById = async (req, res) => {
    const { id } = req.params;

    try {
        const sanction = SanctionService.sanctionedIndividuals.find(ind => ind.dataId === id);
        if (!sanction) {
            return res.status(404).json({ message: 'Sanction not found' });
        }
        res.json(sanction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
