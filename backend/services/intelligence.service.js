import { Assumption } from '../models/assumption.model.js';
import { Risk } from '../models/risk.model.js';

export const IntelligenceService = {
  // ---------- ASSUMPTIONS ----------
  getAssumptions: async (companyId) => {
    return await Assumption.find({ companyId }).sort({ updated_at: -1 });
  },

  saveAssumption: async (companyId, data) => {
    if (data._id) {
      return await Assumption.findOneAndUpdate(
        { _id: data._id, companyId },
        data,
        { new: true }
      );
    }

    return await Assumption.create({
      ...data,
      companyId
    });
  },

  deleteAssumption: async (companyId, id) => {
    await Assumption.deleteOne({ _id: id, companyId });
  },

  // ---------- RISKS ----------
  getRisks: async (companyId) => {
    return await Risk.find({ companyId }).sort({ updated_at: -1 });
  },

  saveRisk: async (companyId, data) => {
    if (data._id) {
      return await Risk.findOneAndUpdate(
        { _id: data._id, companyId },
        data,
        { new: true }
      );
    }

    return await Risk.create({
      ...data,
      companyId
    });
  },

  deleteRisk: async (companyId, id) => {
    await Risk.deleteOne({ _id: id, companyId });
  }
};
