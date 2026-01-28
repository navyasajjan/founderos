import { IntelligenceService } from '../services/intelligence.service.js';

export const IntelligenceController = {
  getAssumptions: async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });

    res.json(await IntelligenceService.getAssumptions(companyId));
  },

  saveAssumption: async (req, res) => {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });

    res.json(
      await IntelligenceService.saveAssumption(companyId, req.body)
    );
  },

  deleteAssumption: async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });

    await IntelligenceService.deleteAssumption(companyId, req.params.id);
    res.status(204).send();
  },

  getRisks: async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });

    res.json(await IntelligenceService.getRisks(companyId));
  },

  saveRisk: async (req, res) => {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });

    res.json(
      await IntelligenceService.saveRisk(companyId, req.body)
    );
  },

  deleteRisk: async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });

    await IntelligenceService.deleteRisk(companyId, req.params.id);
    res.status(204).send();
  }
};
