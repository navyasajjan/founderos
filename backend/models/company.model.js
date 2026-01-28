import mongoose from 'mongoose';

const { Schema } = mongoose;


const FounderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    share: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { _id: false }
);

const AdvisorSchema = new Schema(
  {
    name: {
      type: String,
     
      trim: true
    },
    type: {
      type: String,
     
    },
    firm: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const ComplianceSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'DONE'],
      default: 'PENDING'
    },
    deadline: {
      type: String 
    }
  },
  { timestamps: true }
);


const CompanySchema = new Schema(

  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    entityType: {
      type: String,
      required: true
    },

    cin: {
      type: String,
      unique: true,
      sparse: true
    },

    pan: {
      type: String
    },

    tan: {
      type: String
    },

    gstin: {
      type: String
    },

    incorporationDate: {
      type: Date
    },

    registeredAddress: {
      type: String
    },

    founders: {
      type: [FounderSchema],
      validate: [
        arr => arr.reduce((sum, f) => sum + f.share, 0) <= 100,
        'Total founder share cannot exceed 100%'
      ]
    },

    advisors: [AdvisorSchema],

    complianceChecklist: [ComplianceSchema]
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);


const Company = mongoose.model('Company', CompanySchema);
export default Company;
