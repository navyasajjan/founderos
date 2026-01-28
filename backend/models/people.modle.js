import mongoose from 'mongoose';

const PersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },

    title: {
      type: String, // Developer, Designer, CA, etc.
      trim: true
    },

    description: {
      type: String // "Development"
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },

    employmentType: {
      type: String,
      enum: ['Founder', 'Employee', 'Contractor', 'Advisor'],
      default: 'Employee'
    },

    accessLevel: {
      type: String,
      enum: ['FOUNDER', 'ADMIN', 'VIEWER'],
      default: 'VIEWER'
    },

    responsibilities: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'EXITED'],
      default: 'ACTIVE'
    },

    startDate: {
      type: Date
    },

    linkedAssetIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
      }
    ],

    // linkedDecisionIds: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Decision'
    //   }
    // ],

    notes: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export default mongoose.model('Person', PersonSchema);
