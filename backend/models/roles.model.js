import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    accessLevel: {
      type: String,
      enum: ['FOUNDER', 'ADMIN', 'VIEWER'],
      default: 'VIEWER'
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export default mongoose.model('Role', RoleSchema);
