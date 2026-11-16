import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user ID is required']
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
      maxlength: [100, 'Reason cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
        message: '{VALUE} is not a valid report status'
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

// Schema-level validation: Require at least one subject (itemId or reportedUserId)
reportSchema.pre('validate', function (next) {
  if (!this.itemId && !this.reportedUserId) {
    this.invalidate('itemId', 'Report must reference either an item or a reported user.');
    this.invalidate('reportedUserId', 'Report must reference either an item or a reported user.');
  }
  next();
});

// Indexes defined per specification
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ itemId: 1 });
reportSchema.index({ reportedUserId: 1 });

export const Report = mongoose.model('Report', reportSchema);
export default Report;
