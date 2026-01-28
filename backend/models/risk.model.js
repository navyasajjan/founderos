import mongoose from 'mongoose';

const RiskSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    type: {
      type: String,
    
      required: true
    },

    probability: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    impact: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    mitigationPlan: {
      type: String,
      default: ''
    },

    owner: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['OPEN', 'MITIGATED', 'WATCHING', 'CLOSED'],
      default: 'OPEN'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Risk = mongoose.model('Risk', RiskSchema);
