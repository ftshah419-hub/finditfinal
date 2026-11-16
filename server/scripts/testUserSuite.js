import http from 'http';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';
import Claim from '../src/models/Claim.js';
import Category from '../src/models/Category.js';
import Notification from '../src/models/Notification.js';
import AIMatch from '../src/models/AIMatch.js';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  }
}

async function runUserTestSuite() {
  console.log('='.repeat(70));
  console.log('  FINDIT — Person 2: User Module & Public API Test Suite');
  console.log('='.repeat(70));

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;
  console.log(`\nTest HTTP Server running on port ${port}`);

  const userAEmail = `user_a_${Date.now()}@example.org`;
  const userBEmail = `user_b_${Date.now()}@example.org`;
  const password = 'Password123!';

  let tokenA = '';
  let userAId = null;
  let tokenB = '';
  let userBId = null;
  let categoryId = null;
  let lostItemId = null;
  let foundItemId = null;
  let claimId = null;

  try {
    // 1. Setup Users & Categories
    console.log('\n[1] Registering Test Users A and B:');
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Alpha', email: userAEmail, password })
    });
    const regDataA = await regResA.json();
    tokenA = regDataA.data.token;
    userAId = regDataA.data.user.id;
    assert(Boolean(tokenA && userAId), 'User A registered and token received');

    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Beta', email: userBEmail, password })
    });
    const regDataB = await regResB.json();
    tokenB = regDataB.data.token;
    userBId = regDataB.data.user.id;
    assert(Boolean(tokenB && userBId), 'User B registered and token received');

    // Get Active Category
    const cat = await Category.findOne({ isActive: true });
    categoryId = cat._id.toString();
    assert(Boolean(categoryId), `Using active category: "${cat.name}" (${categoryId})`);

    // 2. Public Categories & Search
    console.log('\n[2] Testing Public Category Listing & Public Search:');
    const catRes = await fetch(`${baseUrl}/users/categories`);
    const catData = await catRes.json();
    assert(catRes.status === 200, 'GET /users/categories returns 200 OK without authentication');
    assert(catData.data.categories.length > 0, 'Returns list of active categories');

    const searchRes = await fetch(`${baseUrl}/users/search?q=MacBook`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, 'GET /users/search returns 200 OK without authentication');
    assert(Array.isArray(searchData.data.items), 'Search returns items array');

    // 3. User Reports Lost Item
    console.log('\n[3] Testing Report Lost Item:');
    const lostItemPayload = {
      title: 'Space Gray MacBook Pro 14-inch',
      description: 'Lost near university library cubicle. Has GitHub sticker on top lid.',
      type: 'LOST',
      categoryId,
      itemDate: new Date().toISOString(),
      location: {
        address: 'Central Library Floor 4',
        city: 'Campus Central',
        state: 'State College'
      }
    };

    const reportLostRes = await fetch(`${baseUrl}/users/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify(lostItemPayload)
    });
    const reportLostData = await reportLostRes.json();
    assert(reportLostRes.status === 201, 'POST /users/items creates lost report with 201 Created');
    assert(reportLostData.data.item.status === 'PENDING', 'New report strictly starts in PENDING status');
    assert(reportLostData.data.item.reportedBy === userAId, 'Server assigns reportedBy from authenticated user');
    lostItemId = reportLostData.data.item._id;

    // Verify PENDING item does NOT appear in public search
    const verifyPublicHidden = await fetch(`${baseUrl}/users/search?q=MacBook`);
    const verifyHiddenData = await verifyPublicHidden.json();
    const isLeaked = verifyHiddenData.data.items.some((i) => i._id === lostItemId);
    assert(!isLeaked, 'Pending lost item is NOT exposed to public search (Privacy Rule)');

    // 4. User B Reports Found Item
    console.log('\n[4] Testing Report Found Item:');
    const foundItemPayload = {
      title: 'Found Apple MacBook Pro in Sleeve',
      description: 'Found dark gray MacBook with decals on study table.',
      type: 'FOUND',
      categoryId,
      itemDate: new Date().toISOString(),
      location: {
        address: 'Central Library Floor 4 Desk 2',
        city: 'Campus Central',
        state: 'State College'
      }
    };

    const reportFoundRes = await fetch(`${baseUrl}/users/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify(foundItemPayload)
    });
    const reportFoundData = await reportFoundRes.json();
    assert(reportFoundRes.status === 201, 'POST /users/items creates found report with 201 Created');
    assert(reportFoundData.data.item.type === 'FOUND', 'Report type is correctly set to FOUND');
    foundItemId = reportFoundData.data.item._id;

    // 5. Get User Items & Item Details
    console.log('\n[5] Testing User Items & Ownership Protection:');
    const myItemsRes = await fetch(`${baseUrl}/users/items`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const myItemsData = await myItemsRes.json();
    assert(myItemsRes.status === 200, 'GET /users/items returns 200 OK');
    assert(myItemsData.data.items.some((i) => i._id === lostItemId), 'User A items list contains created report');

    // Attempt to modify User B item by User A
    const unauthorizedEdit = await fetch(`${baseUrl}/users/items/${foundItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(unauthorizedEdit.status === 403, 'Unauthorized modification of another user report returns 403 Forbidden');

    // 6. Material Edits Return Approved Report to PENDING
    console.log('\n[6] Testing Material Edits on Approved Items Reverting to PENDING:');
    // Simulate Admin approving the item in DB
    await Item.findByIdAndUpdate(lostItemId, { status: 'APPROVED' });
    let dbItem = await Item.findById(lostItemId);
    assert(dbItem.status === 'APPROVED', 'Item was approved by admin');

    // User A updates title
    const updateRes = await fetch(`${baseUrl}/users/items/${lostItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ title: 'Updated MacBook Pro 14 M2 Max' })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'PATCH /users/items/:id succeeded');
    assert(updateData.data.item.status === 'PENDING', 'Material change reset item status to PENDING for re-review');

    // 7. Submit Claims & Claim Rules
    console.log('\n[7] Testing Ownership Claims & Business Rules:');
    // First, approve User B's found item so it can receive claims
    await Item.findByIdAndUpdate(foundItemId, { status: 'APPROVED' });

    // User B attempts to claim their own found item
    const claimOwnRes = await fetch(`${baseUrl}/users/items/${foundItemId}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        proofDescription: 'I found this item and want to claim it myself!'
      })
    });
    assert(claimOwnRes.status === 400, 'Attempting to claim own found item returns 400 Bad Request');

    // User A claims User B's found item
    const validClaimRes = await fetch(`${baseUrl}/users/items/${foundItemId}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        proofDescription: 'This is my MacBook. It has a serial number ending in 8891 and an orange silicone charging brick in the sleeve.'
      })
    });
    const validClaimData = await validClaimRes.json();
    assert(validClaimRes.status === 201, 'POST /users/items/:id/claims returns 201 Created');
    assert(validClaimData.data.claim.status === 'PENDING', 'New claim starts in PENDING status');
    assert(validClaimData.data.claim.claimantId === userAId, 'Claim is automatically associated with User A');
    claimId = validClaimData.data.claim._id;

    // User A attempts duplicate active claim on same item
    const dupClaimRes = await fetch(`${baseUrl}/users/items/${foundItemId}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ proofDescription: 'Second claim attempt on the same item' })
    });
    assert(dupClaimRes.status === 409, 'Duplicate claim on same item returns 409 Conflict');

    // 8. View Claims & Withdraw Claim
    console.log('\n[8] Testing My Claims & Claim Withdrawal:');
    const myClaimsRes = await fetch(`${baseUrl}/users/claims`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const myClaimsData = await myClaimsRes.json();
    assert(myClaimsRes.status === 200, 'GET /users/claims returns 200 OK');
    assert(myClaimsData.data.claims.some((c) => c._id === claimId), 'Claim appears in User A claims list');

    // Withdraw claim
    const withdrawRes = await fetch(`${baseUrl}/users/claims/${claimId}/withdraw`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const withdrawData = await withdrawRes.json();
    assert(withdrawRes.status === 200, 'PATCH /users/claims/:id/withdraw returns 200 OK');
    assert(withdrawData.data.claim.status === 'WITHDRAWN', 'Claim status successfully updated to WITHDRAWN');

    // 9. Notifications
    console.log('\n[9] Testing User Notifications:');
    const notif = await Notification.create({
      recipientId: userAId,
      title: 'Claim Update',
      message: 'Your claim dossier CLM-109 has been received by security desk.',
      type: 'CLAIM_SUBMITTED',
      isRead: false
    });

    const notifRes = await fetch(`${baseUrl}/users/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const notifData = await notifRes.json();
    assert(notifRes.status === 200, 'GET /users/notifications returns 200 OK');
    assert(notifData.data.unreadCount >= 1, 'Unread count reflects unread notifications');

    const markReadRes = await fetch(`${baseUrl}/users/notifications/${notif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(markReadRes.status === 200, 'PATCH /users/notifications/:id/read returns 200 OK');
    const updatedNotif = await Notification.findById(notif._id);
    assert(updatedNotif.isRead === true, 'Notification record updated to isRead: true');

    // 10. User Profile Updates
    console.log('\n[10] Testing User Profile & Privilege Protection:');
    const profileRes = await fetch(`${baseUrl}/users/profile`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200, 'GET /users/profile returns 200 OK');
    assert(profileData.data.user.email === userAEmail, 'Profile matches authenticated user');

    const updateProfileRes = await fetch(`${baseUrl}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Alex Chen',
        phone: '+1 555-0199',
        role: 'ADMIN' // Malicious attempt to elevate role
      })
    });
    const updatedProfileData = await updateProfileRes.json();
    assert(updateProfileRes.status === 200, 'PATCH /users/profile returns 200 OK');
    assert(updatedProfileData.data.user.name === 'Alex Chen', 'Profile name updated');
    assert(updatedProfileData.data.user.role === 'USER', 'Role remains strictly USER; self-promotion prevented');

    // 11. AI Smart Matches for User
    console.log('\n[11] Testing AI Smart Matches:');
    const aiMatchesRes = await fetch(`${baseUrl}/users/ai-matches`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const aiMatchesData = await aiMatchesRes.json();
    assert(aiMatchesRes.status === 200, 'GET /users/ai-matches returns 200 OK');
    assert(Array.isArray(aiMatchesData.data.lostItems), 'Returns user lost items list');
    assert(Array.isArray(aiMatchesData.data.matches), 'Returns algorithmic candidate matches');

    // 12. User Dashboard Aggregated Live Stats
    console.log('\n[12] Testing User Dashboard Live Metrics:');
    const dashStatsRes = await fetch(`${baseUrl}/users/dashboard-stats`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const dashStatsData = await dashStatsRes.json();
    assert(dashStatsRes.status === 200, 'GET /users/dashboard-stats returns 200 OK');
    assert(dashStatsData.data.stats.totalLost >= 1, 'Reflects real total lost reports');
    assert(typeof dashStatsData.data.stats.activeClaims === 'number', 'Reflects real active claims metric');
    assert(Array.isArray(dashStatsData.data.liveCampusItems), 'Provides live campus inventory feeds');

    // 13. Delete Own Item
    console.log('\n[13] Testing Delete Own Item:');
    const deleteRes = await fetch(`${baseUrl}/users/items/${lostItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(deleteRes.status === 200, 'DELETE /users/items/:id successfully deleted item');
    const deletedCheck = await Item.findById(lostItemId);
    assert(deletedCheck === null, 'Item removed from MongoDB');
  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    console.log('\n[14] Cleaning up Test Artifacts:');
    if (userAId) await User.findByIdAndDelete(userAId);
    if (userBId) await User.findByIdAndDelete(userBId);
    if (foundItemId) await Item.findByIdAndDelete(foundItemId);
    if (claimId) await Claim.findByIdAndDelete(claimId);
    await Notification.deleteMany({ recipientId: userAId });
    await AIMatch.deleteMany({ lostItemId });

    server.close();
    await disconnectDB();

    console.log('\n' + '='.repeat(70));
    console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
    if (failures.length > 0) {
      console.log('  Failures:');
      failures.forEach((f) => console.log('   - ' + f));
    }
    console.log('='.repeat(70));
  }
}

runUserTestSuite();
