import { body, param } from 'express-validator';

export const createItemValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),

  body('type')
    .notEmpty().withMessage('Item type is required')
    .isIn(['LOST', 'FOUND']).withMessage('Item type must be either LOST or FOUND'),

  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Category ID must be a valid MongoDB ObjectId'),

  body('itemDate')
    .notEmpty().withMessage('Item date is required')
    .isISO8601().withMessage('Item date must be a valid ISO8601 date'),

  body('location.address')
    .trim()
    .notEmpty().withMessage('Location address is required'),

  body('location.city')
    .trim()
    .notEmpty().withMessage('Location city is required'),

  body('location.state')
    .trim()
    .notEmpty().withMessage('Location state is required'),

  body('location.district')
    .optional({ checkFalsy: true })
    .trim(),

  body('location.coordinates.latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
];

export const updateItemValidator = [
  param('id')
    .isMongoId().withMessage('Item ID in URL parameter must be a valid MongoDB ObjectId'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),

  body('type')
    .optional()
    .isIn(['LOST', 'FOUND']).withMessage('Item type must be either LOST or FOUND'),

  body('categoryId')
    .optional()
    .isMongoId().withMessage('Category ID must be a valid MongoDB ObjectId'),

  body('itemDate')
    .optional()
    .isISO8601().withMessage('Item date must be a valid ISO8601 date'),

  body('location.address')
    .optional()
    .trim()
    .notEmpty().withMessage('Location address cannot be empty if provided'),

  body('location.city')
    .optional()
    .trim()
    .notEmpty().withMessage('Location city cannot be empty if provided'),

  body('location.state')
    .optional()
    .trim()
    .notEmpty().withMessage('Location state cannot be empty if provided')
];

export const itemIdParamValidator = [
  param('id')
    .isMongoId().withMessage('Item ID must be a valid MongoDB ObjectId')
];

export default {
  createItemValidator,
  updateItemValidator,
  itemIdParamValidator
};
