import Company from '../models/company.model.js';

export const CompaniesService = {
  // Get all companies
  getAll: async (userId) => {
    // Fetch only companies where userId matches, sorted by creation date
    return await Company.find({ userId }).sort({ created_at: -1 });
  },

  // Get company by Mongo _id
  getById: async (id) => {
    return await Company.findById(id);
  },

  // Create company
  create: async (data) => {
    const company = new Company(data);
    return await company.save();
  },

  // Update company
  update: async (id, data) => {
    return await Company.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
  },

  // Delete company
  delete: async (id) => {
    await Company.findByIdAndDelete(id);
    return true;
  }
};
