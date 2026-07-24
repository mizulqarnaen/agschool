# Quickstart & Verification Guide: Localization & Multi-Currency

**Feature**: `002-localization-currency`  
**Date**: 2026-07-24  

## Verification Checklist

1. **Localization Verification**:
   - Access `http://localhost:5173/` as a guest; verify all navigation, titles, and buttons render in Indonesian.
   - Switch language to English in header; verify instant translation without page reload.

2. **Currency & Rate Snapshot Verification**:
   - Record an Income entry in SGD 100 with active rate 11,800 IDR.
   - Verify `base_amount_idr: 1,180,000` is saved.
   - Change global rate in Settings to 12,000 IDR.
   - Confirm the past Income record retains its historical rate (11,800 IDR) and base amount (1,180,000 IDR).

3. **Auto / Manual Rate Sync Verification**:
   - Go to System Settings -> Exchange Rate Configuration.
   - Toggle to "Automatic Mode" and click "Sync Now".
   - Confirm the system fetches rates or applies fallback cleanly.
