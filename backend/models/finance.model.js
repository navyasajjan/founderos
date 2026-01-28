import mongoose from 'mongoose';

const ScenarioSchema = new mongoose.Schema({
  name: String,
  burnMultiplier: Number,
  isActive: Boolean
});

const FinanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,   // One finance doc per company
      index: true
    },

    cashBalance: { type: Number, default: 0 },

    scenarios: {
      type: [ScenarioSchema],
      default: [
        { name: 'Realistic', burnMultiplier: 1, isActive: true },
        { name: 'Aggressive Growth', burnMultiplier: 1.5, isActive: false },
        { name: 'Survival Mode', burnMultiplier: 0.7, isActive: false }
      ]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'lastUpdated' }
  }
);

export const Finance = mongoose.model('Finance', FinanceSchema);
