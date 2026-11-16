import mongoose from 'mongoose';

// 1. Import all 9 models
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';
import Claim from '../src/models/Claim.js';
import Notification from '../src/models/Notification.js';
import AIMatch from '../src/models/AIMatch.js';
import Report from '../src/models/Report.js';
import Category from '../src/models/Category.js';
import ActivityLog from '../src/models/ActivityLog.js';
import SystemSetting from '../src/models/SystemSetting.js';

const models = [
  { name: 'User', model: User },
  { name: 'Item', model: Item },
  { name: 'Claim', model: Claim },
  { name: 'Notification', model: Notification },
  { name: 'AIMatch', model: AIMatch },
  { name: 'Report', model: Report },
  { name: 'Category', model: Category },
  { name: 'ActivityLog', model: ActivityLog },
  { name: 'SystemSetting', model: SystemSetting }
];

let errors = [];
let passedChecks = 0;

function check(description, assertion) {
  if (assertion) {
    passedChecks++;
    console.log(`  [PASS] ${description}`);
  } else {
    errors.push(description);
    console.error(`  [FAIL] ${description}`);
  }
}

console.log('='.repeat(70));
console.log('  FINDIT — Mongoose Models & Schema Verification Suite');
console.log('='.repeat(70));

// ── Check 1: Model Existence & Registration ───────────────────────────────
console.log('\n[1] Verifying Model Import & Mongoose Registration:');
for (const { name, model } of models) {
  check(`Model '${name}' is loaded and registered in mongoose.models`, mongoose.models[name] === model);
}

// ── Check 2: User Model & Password Security ──────────────────────────────
console.log('\n[2] Verifying User Model & Password Security:');
const userSchema = User.schema;
const passwordPath = userSchema.path('password');
const rolePath = userSchema.path('role');
const emailPath = userSchema.path('email');

check("User 'password' field has select: false", passwordPath && passwordPath.options.select === false);
check("User 'password' is required", Boolean(passwordPath && (passwordPath.isRequired || passwordPath.options.required)));
check("User 'role' defaults to 'USER'", rolePath && rolePath.defaultValue === 'USER');
check("User 'role' enum values are strictly ['USER', 'ADMIN']", 
  rolePath && Array.isArray(rolePath.options.enum.values) &&
  rolePath.options.enum.values.includes('USER') &&
  rolePath.options.enum.values.includes('ADMIN') &&
  rolePath.options.enum.values.length === 2
);
check("User 'email' has unique constraint", emailPath && emailPath.options.unique === true);
check("User 'email' is trimmed and lowercased", emailPath && emailPath.options.trim && emailPath.options.lowercase);

// Check toJSON transform removes password
const toJSONTransform = userSchema.options.toJSON && userSchema.options.toJSON.transform;
check("User schema defines toJSON transform", typeof toJSONTransform === 'function');
if (typeof toJSONTransform === 'function') {
  const dummyUser = { password: 'secret_hash', passwordResetTokenHash: 'reset_hash', __v: 0, name: 'Test' };
  const sanitized = toJSONTransform({}, { ...dummyUser });
  check("User toJSON transform strips 'password'", sanitized.password === undefined);
  check("User toJSON transform strips 'passwordResetTokenHash'", sanitized.passwordResetTokenHash === undefined);
  check("User toJSON transform strips '__v'", sanitized.__v === undefined);
}

// ── Check 3: Item Model References & Structure ───────────────────────────
console.log('\n[3] Verifying Item Model:');
const itemSchema = Item.schema;
check("Item 'reportedBy' references 'User'", itemSchema.path('reportedBy')?.options?.ref === 'User');
check("Item 'categoryId' references 'Category'", itemSchema.path('categoryId')?.options?.ref === 'Category');
check("Item 'reviewedBy' references 'User'", itemSchema.path('reviewedBy')?.options?.ref === 'User');
check("Item 'type' enum values are ['LOST', 'FOUND']", 
  itemSchema.path('type')?.options?.enum?.values?.join(',') === 'LOST,FOUND'
);
check("Item 'status' enum includes PENDING, APPROVED, REJECTED, RESOLVED", 
  ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'].every(s => itemSchema.path('status')?.options?.enum?.values?.includes(s))
);
check("Item 'status' defaults to 'PENDING'", itemSchema.path('status')?.defaultValue === 'PENDING');
check("Item 'location' contains address, city, state subfields", 
  itemSchema.path('location.address') && itemSchema.path('location.city') && itemSchema.path('location.state')
);
check("Item 'images' array has max length 5 validator", 
  itemSchema.path('images')?.validators?.some(v => v.message?.includes('5'))
);

// ── Check 4: Claim Model References & Consistency ────────────────────────
console.log('\n[4] Verifying Claim Model & Cross-References:');
const claimSchema = Claim.schema;
check("Claim 'itemId' references 'Item'", claimSchema.path('itemId')?.options?.ref === 'Item');
check("Claim 'claimantId' references 'User'", claimSchema.path('claimantId')?.options?.ref === 'User');
check("Claim 'reviewedBy' references 'User'", claimSchema.path('reviewedBy')?.options?.ref === 'User');
check("Claim 'proofDescription' is required", Boolean(claimSchema.path('proofDescription') && (claimSchema.path('proofDescription').isRequired || claimSchema.path('proofDescription').options.required)));
check("Claim 'status' enum includes PENDING, APPROVED, REJECTED, WITHDRAWN", 
  ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'].every(s => claimSchema.path('status')?.options?.enum?.values?.includes(s))
);
check("Claim 'status' defaults to 'PENDING'", claimSchema.path('status')?.defaultValue === 'PENDING');

// ── Check 5: Notification Model References ───────────────────────────────
console.log('\n[5] Verifying Notification Model:');
const notifSchema = Notification.schema;
check("Notification 'recipientId' references 'User'", notifSchema.path('recipientId')?.options?.ref === 'User');
check("Notification 'relatedItemId' references 'Item'", notifSchema.path('relatedItemId')?.options?.ref === 'Item');
check("Notification 'isRead' defaults to false", notifSchema.path('isRead')?.defaultValue === false);

// ── Check 6: AIMatch Model & Compound Unique Index ────────────────────────
console.log('\n[6] Verifying AIMatch Model & Unique Compound Index:');
const aiMatchSchema = AIMatch.schema;
check("AIMatch 'lostItemId' references 'Item'", aiMatchSchema.path('lostItemId')?.options?.ref === 'Item');
check("AIMatch 'foundItemId' references 'Item'", aiMatchSchema.path('foundItemId')?.options?.ref === 'Item');
check("AIMatch 'reviewedBy' references 'User'", aiMatchSchema.path('reviewedBy')?.options?.ref === 'User');
check("AIMatch 'confidence' enum values are ['LOW', 'MEDIUM', 'HIGH']", 
  ['LOW', 'MEDIUM', 'HIGH'].every(c => aiMatchSchema.path('confidence')?.options?.enum?.values?.includes(c))
);

const aiMatchIndexes = aiMatchSchema.indexes();
const hasCompoundIndex = aiMatchIndexes.some(([indexFields, options]) => {
  return indexFields.lostItemId === 1 && indexFields.foundItemId === 1 && options && options.unique === true;
});
check("AIMatch has unique compound index on { lostItemId: 1, foundItemId: 1 }", hasCompoundIndex);

// ── Check 7: Report Model References & Validator ─────────────────────────
console.log('\n[7] Verifying Report Model:');
const reportSchema = Report.schema;
check("Report 'reporterId' references 'User'", reportSchema.path('reporterId')?.options?.ref === 'User');
check("Report 'itemId' references 'Item'", reportSchema.path('itemId')?.options?.ref === 'Item');
check("Report 'reportedUserId' references 'User'", reportSchema.path('reportedUserId')?.options?.ref === 'User');
check("Report 'status' enum includes PENDING, UNDER_REVIEW, RESOLVED, DISMISSED", 
  ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].every(s => reportSchema.path('status')?.options?.enum?.values?.includes(s))
);

// ── Check 8: Category Model ──────────────────────────────────────────────
console.log('\n[8] Verifying Category Model:');
const categorySchema = Category.schema;
check("Category 'name' has unique constraint", categorySchema.path('name')?.options?.unique === true);
check("Category 'isActive' defaults to true", categorySchema.path('isActive')?.defaultValue === true);
check("Category 'createdBy' references 'User'", categorySchema.path('createdBy')?.options?.ref === 'User');

// ── Check 9: ActivityLog Model ───────────────────────────────────────────
console.log('\n[9] Verifying ActivityLog Model:');
const activityLogSchema = ActivityLog.schema;
check("ActivityLog 'actorId' references 'User'", activityLogSchema.path('actorId')?.options?.ref === 'User');
check("ActivityLog 'entityType' enum includes USER, ITEM, CLAIM, REPORT, CATEGORY, SETTING, SYSTEM, AI_MATCH",
  ['USER', 'ITEM', 'CLAIM', 'REPORT', 'CATEGORY', 'SETTING', 'SYSTEM', 'AI_MATCH'].every(e => 
    activityLogSchema.path('entityType')?.options?.enum?.values?.includes(e)
  )
);

// ── Check 10: SystemSetting Model ────────────────────────────────────────
console.log('\n[10] Verifying SystemSetting Model:');
const systemSettingSchema = SystemSetting.schema;
check("SystemSetting 'key' has unique constraint", systemSettingSchema.path('key')?.options?.unique === true);
check("SystemSetting 'updatedBy' references 'User'", systemSettingSchema.path('updatedBy')?.options?.ref === 'User');

// ── Check 11: Schema Timestamps ──────────────────────────────────────────
console.log('\n[11] Verifying Timestamps Configuration:');
check("User has timestamps enabled", User.schema.options.timestamps === true);
check("Item has timestamps enabled", Item.schema.options.timestamps === true);
check("Claim has timestamps enabled", Claim.schema.options.timestamps === true);
check("Category has timestamps enabled", Category.schema.options.timestamps === true);
check("Report has timestamps enabled", Report.schema.options.timestamps === true);
check("AIMatch has timestamps enabled", Boolean(AIMatch.schema.options.timestamps));
check("Notification tracks createdAt timestamp", Boolean(Notification.schema.options.timestamps?.createdAt));
check("ActivityLog tracks createdAt timestamp", Boolean(ActivityLog.schema.options.timestamps?.createdAt));
check("SystemSetting has timestamps enabled", Boolean(SystemSetting.schema.options.timestamps));

// ── Check 12: Reference Integrity ────────────────────────────────────────
console.log('\n[12] Verifying Reference Model Name Targets:');
const registeredModelNames = Object.keys(mongoose.models);
for (const { name, model } of models) {
  model.schema.eachPath((pathName, schematype) => {
    const ref = schematype.options?.ref;
    if (ref) {
      check(`Model '${name}' path '${pathName}' references registered model '${ref}'`, registeredModelNames.includes(ref));
    }
  });
}

// ── Summary ──────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
if (errors.length === 0) {
  console.log(`  ALL ${passedChecks} VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
  console.log('  Zero schema errors, zero broken references, zero duplicate registrations.');
  console.log('='.repeat(70) + '\n');
  process.exit(0);
} else {
  console.error(`  ${errors.length} CHECKS FAILED:`);
  errors.forEach((err, i) => console.error(`    ${i + 1}. ${err}`));
  console.log('='.repeat(70) + '\n');
  process.exit(1);
}
