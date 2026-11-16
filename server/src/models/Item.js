import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    district: {
      type: String,
      trim: true,
      default: null
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      }
    }
  },
  { _id: false }
);

const itemImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required']
    },
    format: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reported by user ID is required']
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required']
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['LOST', 'FOUND'],
        message: '{VALUE} is not a valid item type'
      },
      required: [true, 'Item type (LOST or FOUND) is required']
    },
    location: {
      type: locationSchema,
      required: [true, 'Location details are required']
    },
    itemDate: {
      type: Date,
      required: [true, 'Date when item was lost or found is required']
    },
    images: {
      type: [itemImageSchema],
      default: [],
      validate: [
        (val) => val.length <= 5,
        'Cannot attach more than 5 images to an item'
      ]
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'],
        message: '{VALUE} is not a valid status'
      },
      default: 'PENDING'
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes defined per specification
itemSchema.index({ reportedBy: 1 });
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ categoryId: 1, status: 1 });

export const Item = mongoose.model('Item', itemSchema);
export default Item;
