import { body, param } from 'express-validator';

export const createClaimValidator = [
  param('id')
    .optional()
    .isMongoId().withMessage('Item ID parameter must be a valid MongoDB ObjectId'),

  body('proofDescription')
    .trim()
    .notEmpty().withMessage('Proof of ownership description is required')
    .isLength({ min: 10, max: 3000 }).withMessage('Proof description must be between 10 and 3000 characters')
];

export const claimIdParamValidator = [
  param('id')
    .isMongoId().withMessage('Claim ID must be a valid MongoDB ObjectId')
];

export default {
  createClaimValidator,
  claimIdParamValidator
};
