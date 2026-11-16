import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required']
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

// Unique index on key is created automatically via unique: true on the key field.

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
