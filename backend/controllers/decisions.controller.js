import { DecisionsService } from '../services/decisions.service.js';

export const DecisionsController = {
  list: async (req, res) =>
    res.json(await DecisionsService.getAll(req.params.companyId)),

  create: async (req, res) =>
    res
      .status(201)
      .json(
        await DecisionsService.create(req.params.companyId, req.body)
      ),

  update: async (req, res) =>
    res.json(
      await DecisionsService.update(
        req.params.companyId,
        req.params.id,
        req.body
      )
    ),

  delete: async (req, res) => {
    await DecisionsService.delete(req.params.companyId, req.params.id);
    res.status(204).send();
  }
};
