import mongoose from 'mongoose';

const DecisionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    area: {
      type: String,
      
      required: true
    },

    description: {
      type: String,
      default: ''
    },

    tradeOffs: {
      type: String,
      default: ''
    },

    mentalModels: {
      type: [String],
      default: []
    },

    outcome: {
      type: String,
      enum: ['Pending', 'Success', 'Failure', 'Reversed'],
      default: 'Pending'
    },

    reviewDate: {
      type: String
    },

    linkedRecordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
      }
    ],

    linkedPeopleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
      }
    ]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Decision = mongoose.model('Decision', DecisionSchema);
