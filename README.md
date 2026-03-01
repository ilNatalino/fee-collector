# FantaMoney

Minimal Expo app to track users' payment quotas with a clean 3-tab UX:
- **Home**: circular progress showing collected quota percentage
- **Users**: paid/unpaid status per user
- **Settings**: light/dark mode toggle (persisted locally)

## Tech Stack

- Expo (React Native)
- TypeScript (strict mode)
- Expo Router (file-based tab routing)
- AsyncStorage (theme persistence)
- react-native-svg (circular progress)

## Features

- 3-route tab bar navigation
- Circular quota progress ring with computed percentage
- Payment summary cards (collected, pending, paid, unpaid)
- User list with clear paid/unpaid badges
- Minimal light-first UI with dark mode support
- Clean separation between UI, domain logic, and providers

## Project Structure

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx       # Home
    users.tsx       # Users list
    settings.tsx    # Theme toggle
src/
  components/
    CircularQuotaProgress.tsx
    Screen.tsx
    StatCard.tsx
    UserQuotaRow.tsx
  constants/
    theme.ts
  data/
    mockPayments.ts
  hooks/
    useTheme.ts
  providers/
    ThemeProvider.tsx
    NavigationThemeProvider.tsx
  storage/
    themeStorage.ts
  types/
    quota.ts
  utils/
    quotaMetrics.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Expo Go app (for mobile testing) or Android/iOS emulator

### Install

```bash
npm install
```

### Run

```bash
npm start
```

Then choose a target from the Expo terminal:
- `a` for Android emulator
- `i` for iOS simulator (macOS)
- `w` for web
- or scan the QR code with Expo Go

## Available Scripts

```bash
npm start        # Start Expo dev server
npm run android  # Launch on Android
npm run ios      # Launch on iOS
npm run web      # Launch on web
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript checks
```

## Clean Code Notes

- Business logic is isolated in `src/utils/quotaMetrics.ts`
- Domain types are centralized in `src/types/quota.ts`
- UI components are reusable and presentation-focused
- Theme state and persistence are handled in providers/storage layers
- Route files stay thin and compose reusable pieces

## Customize Data

Edit mock users and payment status in:
- `src/data/mockPayments.ts`

The Home screen metrics and progress ring update automatically from this data.

## Dark Mode Behavior

- Theme defaults to light mode
- Toggling dark mode in **Settings** persists the choice using AsyncStorage
- App theme is applied globally across tabs and screens

## Next Improvements (Optional)

- Add create/edit payment flows
- Persist quotas in a backend or local database
- Add filters (paid/unpaid) and search in Users
- Add tests for `quotaMetrics`
