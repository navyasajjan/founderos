import Record from '../models/records.model.js';

export const RecordsService = {
  getAll: async (companyId) => {
    return Record.find({ companyId }).sort({ createdAt: -1 });
  },

  getById: async (id, companyId) => {
    return Record.findOne({ _id: id, companyId });
  },

  saveRecord: async (data, companyId, ownerName) => {
    // EDIT
    if (data._id) {
      return Record.findOneAndUpdate(
        { _id: data._id, companyId },
        {
          ...data,
          companyId,                 // 🔴 REQUIRED
          primaryOwner: ownerName
        },
        { new: true }
      );
    }

    // CREATE
    return Record.create({
      ...data,
      companyId,                     // 🔴 REQUIRED
      primaryOwner: ownerName
    });
  },

  deleteRecord: async (id, companyId) => {
    await Record.findOneAndDelete({ _id: id, companyId });
    return true;
  }
};
