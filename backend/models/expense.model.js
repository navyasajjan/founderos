import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    name: { type: String, required: true },

    type: {
      type: String,
      enum: ['RECURRING', 'ONE_TIME'],
      required: true
    },

    category: {
      type: String,
      enum: [
        'Payroll',
        'SaaS/Tools',
        'Infrastructure',
        'Marketing',
        'Legal/Compliance',
        'Rent/Office',
        'Other'
      ],
      required: true
    },

    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'ANNUAL', 'ONE_TIME'],
      required: true
    },

    amount: { type: Number, required: true },

    startDate: String,
    notes: { type: String, default: '' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Expense = mongoose.model('Expense', ExpenseSchema);
