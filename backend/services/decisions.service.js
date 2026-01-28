import { Decision } from '../models/decision.model.js';

export const DecisionsService = {
  getAll: async (companyId) => {
    return await Decision.find({ companyId }).sort({ created_at: -1 });
  },

  create: async (companyId, data) => {
    const decision = new Decision({
      ...data,
      companyId
    });

    return await decision.save();
  },

  update: async (companyId, id, data) => {
    return await Decision.findOneAndUpdate(
      { _id: id, companyId },
      data,
      { new: true }
    );
  },

  delete: async (companyId, id) => {
    await Decision.deleteOne({ _id: id, companyId });
    return true;
  }
};
