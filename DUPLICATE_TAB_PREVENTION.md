# Duplicate Tab Prevention

## Overview

The system now prevents participants from opening the same waiting room link in multiple tabs or windows. This ensures data integrity and prevents confusion.

---

## How It Works

### First Tab (Original):
```
Participant clicks link → Gender form → Waiting room ✅
```

### Second Tab (Duplicate):
```
Participant clicks link → Error message ❌
"You have already joined this waiting room"
```

---

## Error Message

When a participant tries to open the link in a second tab:

```
┌─────────────────────────────────────────────────┐
│  Already in Waiting Room                        │
│                                                 │
│  You have already joined this waiting room.     │
│  Please use your original tab/window.           │
│                                                 │
│  ⚠️ You are Participant #2                      │
│     Joined at: 10:30:45 AM                      │
│                                                 │
│  ⚠️ Please return to your original tab/window   │
│     to see your waiting room status.            │
│                                                 │
│  Opening multiple tabs can cause issues with    │
│  your participation.                            │
│                                                 │
│  [Return Home]                                  │
└─────────────────────────────────────────────────┘
```

---

## Detection Method

### Browser Fingerprinting:
- System generates unique fingerprint for each browser
- Based on: User agent, screen size, timezone, canvas
- Stored when participant first joins
- Checked on every join attempt

### How It Works:
1. Participant opens link in Tab 1
2. System generates fingerprint: `abc123...`
3. Stores in database with participant info
4. Participant opens link in Tab 2
5. System generates same fingerprint: `abc123...`
6. Finds existing record → Shows error

---

## Benefits

### 1. Data Integrity
- Prevents duplicate entries
- Ensures accurate participant count
- Maintains clean database

### 2. User Experience
- Clear error message
- Helpful instructions
- Shows participant number

### 3. System Stability
- Prevents race conditions
- Avoids conflicting states
- Reduces server load

### 4. Experiment Quality
- One participant = one entry
- Accurate group formation
- Reliable data collection

---

## User Instructions

### What Participants See:

**Error Title:**
> "Already in Waiting Room"

**Error Message:**
> "You have already joined this waiting room. Please use your original tab/window."

**Additional Info:**
- Participant number
- Join timestamp
- Warning about multiple tabs

**Action:**
- Return to original tab
- Close duplicate tab
- Continue waiting in original tab

---

## Technical Details

### API Response:

When duplicate detected:
```javascript
{
  error: "You have already joined this waiting room. Please use your original tab/window.",
  canJoin: false,
  errorType: "already_joined",
  participantNumber: 2,
  status: "waiting",
  joinedAt: "2024-01-15T10:30:45.000Z"
}
```

### HTTP Status:
- **403 Forbidden** - Cannot join again

### Error Type:
- `already_joined` - Specific error type for duplicate tabs

---

## Edge Cases

### Case 1: Browser Refresh
**Scenario:** Participant refreshes the page

**Result:** ✅ Allowed
- Same tab, same fingerprint
- Shows error but harmless
- Participant should use original tab

**Why:** Browser refresh generates same fingerprint

---

### Case 2: Different Browser
**Scenario:** Participant opens link in Chrome, then Firefox

**Result:** ✅ Allowed (different fingerprint)
- Different browser = different fingerprint
- Treated as different participant
- Both can join (if different Prolific IDs)

**Note:** This is intentional - different browsers are different devices

---

### Case 3: Incognito Mode
**Scenario:** Participant opens in normal mode, then incognito

**Result:** ✅ Allowed (different fingerprint)
- Incognito mode = different fingerprint
- Treated as different participant

**Note:** This is a limitation of browser fingerprinting

---

### Case 4: Same Device, Different Tabs
**Scenario:** Participant opens multiple tabs in same browser

**Result:** ❌ Blocked
- Same browser = same fingerprint
- Second tab shows error
- Must use original tab

**This is the main use case we're preventing**

---

## Comparison with Old Behavior

### Before:
```
Tab 1: Opens → Joins as Participant #1 → Waiting
Tab 2: Opens → Shows same waiting room → Confusing
```
- Both tabs showed waiting room
- Participant confused about which to use
- Potential for data inconsistency

### After:
```
Tab 1: Opens → Joins as Participant #1 → Waiting ✅
Tab 2: Opens → Error: "Already joined" → Clear message ❌
```
- Only first tab shows waiting room
- Clear error on second tab
- No confusion

---

## Admin View

### In Waiting Room Monitor:

Admins see only one entry per participant:
```
Waiting Tab:
#1  prolific_123  Gender: MALE  Joined: 10:30:45 AM
```

Even if participant opened multiple tabs, only one entry exists.

---

## Troubleshooting

### Issue: Participant says they can't join

**Check:**
1. Did they already join?
2. Are they using a different tab?
3. Check admin monitor for their Prolific ID

**Solution:**
- Tell them to find their original tab
- Or close all tabs and start fresh
- System will recognize them on rejoin

---

### Issue: Participant closed original tab

**Scenario:** Participant joined, closed tab, wants to rejoin

**Result:** ❌ Shows error
- System remembers they joined
- Cannot rejoin from new tab

**Solution:**
- This is intentional behavior
- Prevents duplicate participation
- Participant should keep original tab open

**Workaround:**
- Admin can reset the link
- Participant can join again
- Use with caution

---

## Best Practices

### For Participants:

1. **Keep original tab open**
   - Don't close the waiting room tab
   - Don't open link in multiple tabs
   - Wait in the original tab

2. **If you see error:**
   - Find your original tab
   - Close duplicate tabs
   - Continue in original tab

3. **If you closed original tab:**
   - Contact experiment administrator
   - Don't try to rejoin
   - Wait for instructions

### For Admins:

1. **Communicate clearly:**
   - Tell participants to keep tab open
   - Warn against multiple tabs
   - Provide clear instructions

2. **Monitor for issues:**
   - Check waiting room monitor
   - Look for stuck participants
   - Be ready to help

3. **Handle edge cases:**
   - If participant genuinely needs to rejoin
   - Consider resetting their entry
   - Document the decision

---

## Security Considerations

### Fingerprinting Limitations:

**Not 100% unique:**
- Similar devices may have similar fingerprints
- Incognito mode changes fingerprint
- VPNs don't affect fingerprint

**Good enough for:**
- Preventing accidental duplicates
- Catching most duplicate tabs
- Maintaining data quality

**Not suitable for:**
- Security authentication
- Payment verification
- Legal identity verification

---

## Future Enhancements

### Possible Improvements:

1. **Session Storage:**
   - Store join status in browser session
   - Persist across refreshes
   - Clear on tab close

2. **Tab Communication:**
   - Use Broadcast Channel API
   - Sync state across tabs
   - Show live status in all tabs

3. **Graceful Handling:**
   - Allow viewing status in second tab
   - Show read-only waiting room
   - Sync with original tab

---

## Summary

The duplicate tab prevention:
- ✅ **Prevents** participants from opening multiple tabs
- ✅ **Shows** clear error message
- ✅ **Maintains** data integrity
- ✅ **Improves** user experience
- ✅ **Reduces** confusion
- ✅ **Protects** experiment quality

**Essential for reliable experiments!** 🔒
