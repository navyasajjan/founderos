import { CompaniesService } from '../services/companies.service.js';

export const CompaniesController = {
  list: async (_req, res) => {
    try {
      const userId = _req.user.id;
      const data = await CompaniesService.getAll(userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  },

  getById: async (req, res) => {
    try {
      const company = await CompaniesService.getById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      res.status(400).json({ error: 'Invalid company ID' });
    }
  },

  create: async (req, res) => {
    try {

       const companyData = {
        ...req.body,
        userId: req.user.id
      };
      const company = await CompaniesService.create(companyData);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({
        error: 'Failed to create company',
        details: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const company = await CompaniesService.update(req.params.id, req.body);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      res.status(400).json({
        error: 'Failed to update company',
        details: error.message
      });
    }
  },

  delete: async (req, res) => {
    try {
      await CompaniesService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete company' });
    }
  }
};
