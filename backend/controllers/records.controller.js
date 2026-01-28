import { RecordsService } from '../services/records.service.js';

export const RecordsController = {
  // GET /records?companyId=xxx
  list: async (req, res) => {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId is required' });
      }

      const records = await RecordsService.getAll(companyId);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /records/:id?companyId=xxx
  getOne: async (req, res) => {
    try {
      const { companyId } = req.query;
      const { id } = req.params;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId is required' });
      }

      const record = await RecordsService.getById(id, companyId);
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST /records  OR  PUT /records/:id
  save: async (req, res) => {
    try {
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId is required' });
      }

      const record = await RecordsService.saveRecord(
        req.body,
        companyId,
        req.user.fullName
      );

      res.status(req.body._id ? 200 : 201).json(record);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // DELETE /records/:id?companyId=xxx
  delete: async (req, res) => {
    try {
      const { companyId } = req.query;
      const { id } = req.params;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId is required' });
      }

      await RecordsService.deleteRecord(id, companyId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
