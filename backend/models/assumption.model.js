import mongoose from 'mongoose';

const AssumptionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    statement: {
      type: String,
      required: true,
      trim: true
    },

    area: {
      type: String,
    
      required: true
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    evidence: {
      type: String,
      default: ''
    },

    validationDate: {
      type: String
    },

    status: {
      type: String,
      enum: ['Unvalidated', 'Validated', 'Invalidated'],
      default: 'Unvalidated'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Assumption = mongoose.model('Assumption', AssumptionSchema);
