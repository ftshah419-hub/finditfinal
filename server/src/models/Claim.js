import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Evidence URL is required']
    },
    publicId: {
      type: String,
      default: null
    },
    format: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required']
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant user ID is required']
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    proofDescription: {
      type: String,
      required: [true, 'Proof description is required'],
      trim: true,
      minlength: [10, 'Proof description must be at least 10 characters long'],
      maxlength: [3000, 'Proof description cannot exceed 3000 characters']
    },
    evidence: {
      type: [evidenceSchema],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
        message: '{VALUE} is not a valid claim status'
      },
      default: 'PENDING'
    },
    adminNote: {
      type: String,
      trim: true,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes defined per specification
claimSchema.index({ itemId: 1, status: 1 });
claimSchema.index({ claimantId: 1, createdAt: -1 });

export const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
