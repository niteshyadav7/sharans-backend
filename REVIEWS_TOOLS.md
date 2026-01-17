# 🛠️ Reviews System Tools Guide

## 1. Automated Testing 🧪
The reviews system comes with a comprehensive integration test suite using Jest and Supertest.

**Run tests:**
```bash
npm test __tests__/integration/review.test.js
```

**Coverage includes:**
- Creating reviews (validation, rating limits)
- Preventing duplicates (one review per user/product)
- Verified purchase detection
- Getting product reviews (pagination, filtering)
- Updating/deleting own reviews
- Admin moderation (status updates, responses)
- Automatic rating calculation

## 2. Review Monitoring 📊
A dashboard script to view live statistics and recent activity.

**Run dashboard:**
```bash
npm run monitor:reviews
```

**Features:**
- Overall statistics (Total, Approved, Pending)
- 1-5 Star rating distribution
- Average rating across all products
- Recent reviews list
- Top reviewed products
- Most helpful reviews
- Top reviewers list

## 3. Review Moderation 🛡️
An interactive CLI tool to process pending reviews.

**Run tool:**
```bash
npm run moderate:reviews
```

**Workflow:**
1. Shows pending reviews one by one
2. Displays detailed actionable info (Verified status, User, Content)
3. Actions:
   - `[a]` Approve -> Published immediately + Rating updated
   - `[r]` Reject -> Hidden from public
   - `[s]` Skip -> Keep pending for later
   - `[q]` Quit

## 4. Configuration ⚙️
Configure behavior in `.env`:

```env
# Moderation
REVIEW_AUTO_APPROVE=true       # Set false to require manual approval
REVIEW_MIN_RATING=1
REVIEW_MAX_RATING=5

# Notifications (Future)
REVIEW_NOTIFY_ADMIN=true
```

## 5. Security Features 🔒
- **JWT Authorization:** Required for all write operations
- **Ownership Check:** Users can only edit/delete their own reviews
- **Admin Access:** Only admins can moderate or delete any review
- **Input Validation:** Strict limits on rating (1-5), comments (max 1000 chars)
- **Verified Purchase:** Logic checks `Order` history before awarding badge
