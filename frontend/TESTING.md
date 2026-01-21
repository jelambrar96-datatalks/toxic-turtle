# Frontend Testing Documentation

## Overview

This document provides guidelines for testing the Toxic Turtle React frontend application.

## Manual Testing Checklist

### 1. Authentication Flow

#### Login Page
- [ ] Page loads at `/login`
- [ ] Email and password fields are visible
- [ ] "Don't have an account?" link points to `/register`
- [ ] Submit button disabled until both fields filled
- [ ] Invalid credentials show error alert
- [ ] Valid credentials redirect to `/home`
- [ ] JWT token stored in localStorage after login

#### Register Page
- [ ] Page loads at `/register`
- [ ] Username, email, password fields visible
- [ ] "Already have an account?" link points to `/login`
- [ ] Submit button disabled until all fields filled
- [ ] Email validation works (basic)
- [ ] Password fields don't show plaintext
- [ ] Success redirects to `/home` with auto-login
- [ ] Existing email shows error message
- [ ] Token auto-stored after registration

### 2. Home Page

#### Header and Navigation
- [ ] Title "🐢 Toxic Turtle" displays
- [ ] Current level shows: "Current Level: X / Total"
- [ ] Logout button present and functional
- [ ] Trophy button only shows when all levels passed
- [ ] Trophy button links to `/certificate`

#### Level Grid
- [ ] Grid displays all levels (default 4)
- [ ] First level always unlocked
- [ ] Completed levels show ✓ checkmark
- [ ] Next level shows with unlock arrow
- [ ] Locked levels show 🔒 icon
- [ ] Locked levels disabled (can't click)
- [ ] Unlocked levels clickable → navigate to game
- [ ] Grid responsive on mobile (columns adjust)

#### Loading and Errors
- [ ] Loading message shows while fetching data
- [ ] Error message displays if API fails
- [ ] "Try Again" button retries API call

### 3. Game Page

#### Page Load
- [ ] Page accessible at `/game/1`, `/game/2`, etc.
- [ ] Returns 403 if trying to access locked level
- [ ] Level data loads: code, movements, cursor info
- [ ] Canvas initializes without errors

#### Code Viewer (Left Panel)
- [ ] Code displays line by line
- [ ] Line numbers show (1, 2, 3...)
- [ ] Yellow highlight on current line
- [ ] Cursor marker (▶) animates

#### Canvas (Right Panel)
- [ ] Canvas loads with blue background
- [ ] Grid visible (optional visual aid)
- [ ] Turtle sprite visible at center
- [ ] Turtle initially facing up
- [ ] Lines drawn when turtle moves

#### Keyboard Controls
- [ ] **Space key**: Turtle moves forward 40px, line drawn
- [ ] **← Arrow**: Turtle rotates left 90°
- [ ] **→ Arrow**: Turtle rotates right 90°
- [ ] **↓ Arrow**: Works as forward (if configured)
- [ ] Correct input plays success sound (beep)
- [ ] Incorrect input plays error sound (low beep)
- [ ] Focus needed on canvas for input to work

#### Level Progression
- [ ] Cursor advances after correct input
- [ ] Yellow highlight moves to next line
- [ ] Level completes after all commands executed
- [ ] Success message displays
- [ ] Auto-redirects to `/home` after 2 seconds

#### Error Handling
- [ ] Invalid level redirects to `/home`
- [ ] API errors show alert with message
- [ ] "← Return Home" button always visible
- [ ] Can navigate away mid-game

### 4. Certificate Page

#### First Time (No Certificate)
- [ ] Page loads at `/certificate`
- [ ] Modal asks for full name
- [ ] Input field focused (ready to type)
- [ ] Submit button disabled until name entered
- [ ] Valid name generates certificate
- [ ] HTML certificate file downloads
- [ ] Success message displays
- [ ] Auto-redirects to `/home` after 2 seconds

#### Repeat Visit (Certificate Exists)
- [ ] Modal skipped
- [ ] Certificate auto-downloads
- [ ] Content page shows achievements
- [ ] Can download again if desired

#### Certificate HTML
- [ ] Displays with purple gradient background
- [ ] Shows child's full name prominently
- [ ] Shows date of completion
- [ ] Includes 🐢 turtle emoji
- [ ] Includes 🏆 trophy emoji
- [ ] Can be printed to PDF
- [ ] File named with user name

### 5. Responsive Design

#### Desktop (1200px+)
- [ ] All content visible without scrolling
- [ ] Two-column layout on game page (code | canvas)
- [ ] Buttons properly sized and spaced
- [ ] Fonts readable

#### Tablet (768px - 1200px)
- [ ] Layout adjusts without breaking
- [ ] Touch targets remain large (min 44px)
- [ ] Scrolling smooth and natural
- [ ] No horizontal scroll

#### Mobile (480px - 768px)
- [ ] Single column layout on game page
- [ ] Code viewer above canvas
- [ ] Touch controls work well
- [ ] Level grid adjusted to fit

#### Small Mobile (<480px)
- [ ] All elements accessible
- [ ] Minimum padding maintained
- [ ] No overlap of UI elements
- [ ] Readable text (no truncation)

### 6. Sound Effects

- [ ] Success sound plays on correct input (800Hz, 100ms)
- [ ] Error sound plays on incorrect input (300Hz, 50ms)
- [ ] Sounds don't distort or clip
- [ ] Volume appropriate for children
- [ ] Can be muted via browser controls

### 7. Session Management

- [ ] Token persists across page reloads
- [ ] Logout clears token from localStorage
- [ ] Protected routes redirect to login without token
- [ ] Login page redirects to `/home` if already logged in
- [ ] Token expiry handled gracefully

### 8. Edge Cases

- [ ] Browser back button doesn't break state
- [ ] Rapid clicking on buttons doesn't cause issues
- [ ] Very long usernames display correctly
- [ ] Special characters in names handled
- [ ] Refresh during game preserves state
- [ ] Network interruption shows friendly error
- [ ] Very slow networks don't timeout

## Automated Testing

### Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Example Test (HomePage.test.js)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../pages/HomePage';
import * as api from '../api';

jest.mock('../api');

describe('HomePage', () => {
  it('should load and display level grid', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValue({
      current_level: 1,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValue({
      all_levels_passed: false,
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('🐢 Toxic Turtle')).toBeInTheDocument();
    });
  });
});
```

### Run Tests

```bash
npm test
```

## Performance Testing

### Lighthouse Audit

```bash
npm run build
npm install -g http-server
http-server -p 3000 -c-1
# Open Chrome DevTools → Lighthouse → Generate Report
```

### Targets
- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

## Browser Compatibility

### Tested Browsers
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Feature Detection
- [ ] LocalStorage available
- [ ] Canvas API supported
- [ ] Web Audio API supported
- [ ] ES6 syntax supported
- [ ] Fetch API supported

## Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader reads all content
- [ ] Color contrast meets WCAG AA
- [ ] Images have alt text
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Focus indicators visible
- [ ] No keyboard traps

## Security Testing

- [ ] XSS prevention: HTML escaping in place
- [ ] CSRF tokens sent with API requests
- [ ] Token doesn't expose in URL
- [ ] Passwords never logged
- [ ] Secrets not hardcoded
- [ ] API calls over HTTPS in production
- [ ] No sensitive data in localStorage (only JWT)

## Performance Metrics

### Target Times
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s
- **API Response Time**: < 500ms

### Monitor with
```bash
npm run build
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

## Common Issues & Fixes

### Issue: Blank Canvas
**Solution**: Check browser console, verify Canvas support, check API responses

### Issue: Keyboard Controls Unresponsive
**Solution**: Click canvas first, verify event listeners, check browser console

### Issue: Token Expires During Game
**Solution**: Show modal to re-login, save game progress, auto-resume

### Issue: Mobile Tap Targets Too Small
**Solution**: Increase button padding to min 44px, increase level button size

### Issue: Slow API Responses
**Solution**: Add loading spinners, implement request cancellation, show timeout messages

## Deployment Testing

After deploying to production:

1. **Smoke Test**
   - [ ] Site loads without errors
   - [ ] Can register new user
   - [ ] Can login
   - [ ] Can play level 1
   - [ ] Certificate downloads

2. **Integration Test**
   - [ ] Backend API connectivity
   - [ ] Database operations successful
   - [ ] All CORS headers correct

3. **Performance Test**
   - [ ] Lighthouse scores acceptable
   - [ ] Load times under targets
   - [ ] No console errors

## Regression Testing

When making changes:

1. Run all manual tests from checklist above
2. Run automated tests: `npm test`
3. Run Lighthouse audit
4. Test on mobile device (or simulator)
5. Verify all keyboard controls
6. Check error boundaries work

## User Acceptance Testing (UAT)

Have children (7-11 years old) test:

- [ ] Can they understand the interface?
- [ ] Are colors appealing?
- [ ] Is the turtle sprite cute?
- [ ] Do keyboard controls feel natural?
- [ ] Is the game fun?
- [ ] Can they complete a level?
- [ ] Do they want to play more levels?
- [ ] Is the certificate satisfying?

## Known Limitations

- No offline support (requires internet connection)
- No undo/redo functionality
- No hint system
- No level editor
- No multiplayer
- No in-game scoring/timing
- No sound toggle option

## Future Testing Scenarios

- [ ] E2E tests with Cypress/Playwright
- [ ] Load testing for concurrent users
- [ ] Accessibility audit with WAVE
- [ ] Performance budget enforcement
- [ ] Visual regression testing
- [ ] Cross-device testing farm
- [ ] A/B testing different UI designs

