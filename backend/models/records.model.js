import { Schema, model } from 'mongoose';

const RecordSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: {
      type: String,
      enum: ['Vendor', 'Tool', 'Service', 'Subscription'],
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Expired', 'Cancelled'],
      default: 'Active'
    },
    startDate: { type: Date, required: true },
    renewalDate: { type: Date },
    cost: { type: Number, required: true, min: 0 },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'],
      required: true
    },
    paymentMethod: { type: String },
    primaryOwner: { type: String, required: true },
    backupOwner: { type: String },
    tags: { type: [String], default: [] },
    notes: { type: String },
    decisionLog: { type: [Schema.Types.ObjectId], ref: 'Decision', default: [] },
    risks: { type: [String], default: [] },
    alternatives: { type: [String], default: [] },
    links: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Record = model('Record', RecordSchema);
export default Record;
