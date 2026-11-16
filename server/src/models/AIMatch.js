import mongoose from 'mongoose';

const aiMatchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Lost item ID reference is required']
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found item ID reference is required']
    },
    similarityScore: {
      type: Number,
      required: [true, 'Similarity score is required'],
      min: [0, 'Similarity score cannot be negative'],
      max: [100, 'Similarity score cannot exceed 100']
    },
    confidence: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: '{VALUE} is not a valid confidence level'
      },
      required: [true, 'Confidence level is required']
    },
    matchingFeatures: {
      type: [String],
      default: []
    },
    differences: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'REVIEWED', 'CONFIRMED', 'DISMISSED'],
        message: '{VALUE} is not a valid match status'
      },
      default: 'PENDING'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

// Unique compound index: prevent duplicate pairings of the same lost & found items
aiMatchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

export const AIMatch = mongoose.model('AIMatch', aiMatchSchema);
export default AIMatch;
