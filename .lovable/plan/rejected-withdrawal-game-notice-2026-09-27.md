# Rejected Withdrawal Game Notice

## Goal
Show a clear dialog whenever a signed-in user with a rejected withdrawal opens any game.

## Changes
- Add a shared notice that checks the signed-in user's latest rejected withdrawal.
- Display it only on game pages and reopen it whenever the user enters a game.
- Show the rejected amount, request date, rejection reason when available, and `lawVservices@proton.me` for support.
- Include a button that opens a new email addressed to support and a dismiss button.
- Keep other users and non-game pages unaffected.

## Verification
- Confirm users with a rejected withdrawal see the dialog on game entry.
- Confirm users without a rejected withdrawal do not see it.
- Confirm the support email action and mobile layout work without errors.

## Technical details
- Implement one route-aware shared React component mounted inside the existing router.
- Read only the current authenticated user's rejected withdrawals; existing row-level access remains authoritative.
