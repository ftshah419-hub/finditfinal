import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Nullable for automated system processes
    },
    action: {
      type: String,
      required: [true, 'Activity action is required'],
      trim: true
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: {
        values: ['USER', 'ITEM', 'CLAIM', 'REPORT', 'CATEGORY', 'SETTING', 'SYSTEM', 'AI_MATCH'],
        message: '{VALUE} is not a valid entity type'
      }
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Indexes defined per specification
activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
