# goals. - Complete Feature Documentation

## Core Features

### 1. **AI-Powered Goal Creation & Planning**
- **Conversational Onboarding**: Natural chat interface where users introduce themselves and describe their goals
- **Intelligent Game Plan Generation**: AI automatically creates structured, multi-milestone plans with actionable steps
- **Context-Aware Suggestions**: AI understands goal categories (fitness, business, learning, etc.) and tailors plans accordingly
- **Automatic Push Notification Setup**: Goals automatically include reminder schedules based on best practices

### 2. **Smart Game Plan System**
- **Full Visibility**: Users can view their entire goal journey from start to finish at any time
- **Milestone-Based Structure**: Goals broken into logical milestones that unlock sequentially
- **Next Action Focus**: App surfaces ONE required action at a time to prevent overwhelm
- **Inline Editing**: 
  - Edit step titles and descriptions directly
  - Mark steps as required/optional with star toggle
  - Add, edit, or delete subtasks on the fly
  - Reorder steps within milestones
  - All changes auto-save without confirmation dialogs

### 3. **Adaptive Progress Tracking**
- **Step Completion Types**:
  - Standard completion (task done)
  - Effort-based completion (worked on it for X minutes)
  - Skip with tracking (counts skip frequency)
- **Smart Skip Detection**: If a step is skipped 2+ times, app suggests breaking it down via chat
- **Milestone Auto-Progression**: Next milestone unlocks automatically when all required steps in current milestone are complete
- **Fallback Actions**: Optional easier alternatives for difficult steps to preserve momentum

### 4. **Intelligent Chat Coach**
- **Unlimited Context**: Chat remembers full conversation history
- **Goal Modification**: Users can request changes to existing goals through natural conversation
- **Help Integration**: "Need Help?" buttons throughout app connect directly to relevant chat context
- **Message Limits (Free)**: 15 messages per day; resets daily at midnight
- **Unlimited Chat (Premium)**: No message restrictions

### 5. **Goal State Management**
- **Active Goals**: Currently being worked on; show next action on home screen
- **Paused Goals**: Remain visible in Game Plan but disappear from Today view; single-tap to resume
- **Completed Goals**: Celebration screen with options to Maintain, Expand, or Archive
- **Dormant Detection**: After 7 days of inactivity, app offers gentle "restart" or "make easier" options
- **Archive System**: Completed or abandoned goals can be archived

### 6. **Gamification & Motivation**
- **Points System**:
  - Profile setup: Initial points
  - Step completion: 10 points
  - Subtask completion: 5 points
  - Goal completion: Bonus points
  - Chat interaction: Points for engagement
- **Level System**: Dynamic leveling based on total points earned
- **Daily Streaks**: Track consecutive days of activity
- **Level-Up Celebrations**: Visual celebrations when reaching new levels
- **XP Progress Bars**: Real-time visual feedback on progress to next level

### 7. **Dynamic Leaderboard**
- **Real User Ranking**: Your actual position based on points earned
- **Top 10 Display**: Shows current top performers with names, points, and levels
- **"YOU" Badge**: Clearly highlights your position in the leaderboard
- **Privacy Controls**: Toggle public ranking on/off
- **Rank Icons**: Special gold, silver, and bronze medals for top 3 positions
- **Weekly Prize Pool**: "Coming Soon" feature teaser for future competitions

### 8. **Premium Subscription System**
- **Freemium Model**:
  - Free: 3 goals max, 15 chat messages/day, ads, 24hr support
  - Premium: Unlimited goals, unlimited chat, no ads, analytics, priority support
- **RevenueCat Integration**: Cross-platform subscription management
- **Package Options**: Monthly and yearly plans (with "Best Value" badge)
- **Purchase Restoration**: Easy restore for users switching devices
- **Graceful Degradation**: App fully functional without subscription

### 9. **Notification System**
- **OneSignal Integration**: Push notifications for reminders and progress updates
- **Notification Types**:
  - Progress Updates: Milestone completions, achievements
  - Reminders: Step-specific recurring reminders
  - Achievements: Level ups and streaks
- **Granular Controls**: Toggle each notification type individually
- **Debug Panel**: Settings screen shows OneSignal Player ID and configuration status

### 10. **Theme System**
- **Three Theme Options**:
  - Light: Clean, bright interface
  - Dark: Eye-friendly dark mode
  - Colorful: Vibrant, energetic theme
- **Persistent Storage**: Theme choice saved across sessions
- **Instant Switching**: No app restart required
- **Consistent Theming**: All screens respect selected theme

### 11. **User Profile & Progress**
- **Profile Creation**: Name collection with automatic capitalization
- **Member Since**: Account creation date tracking
- **Level Badge**: Displays current level and points everywhere
- **Public/Private Rank**: Control leaderboard visibility
- **Progress Stats**:
  - Active goals count
  - Daily streak
  - Total completed steps

### 12. **Banner Ads (Free Tier)**
- **Non-Intrusive Placement**: Bottom of screens only
- **Premium Removal**: Ads completely removed for premium users
- **Smart Display**: Only shown to free users
- **Multiple Ad Networks**: Fallback system for better fill rates

### 13. **OpenAI API Configuration**
- **Custom API Keys**: Users can provide their own OpenAI API key
- **Secure Storage**: Keys stored locally using AsyncStorage
- **Status Indicators**: Visual confirmation when API is configured
- **Settings Integration**: Easy access to configure/update API key
- **Graceful Fallback**: Clear error messages if API key is missing

### 14. **Data Persistence**
- **Local Storage**: All data saved to device using AsyncStorage
- **Auto-Save**: Changes saved immediately without user action
- **No Account Required**: Fully functional offline-first app
- **Data Types Stored**:
  - User profile and preferences
  - All goals and game plans
  - Chat history
  - Gamification progress
  - Theme and notification settings

### 15. **Smooth Animations**
- **Entry Animations**: Home screen elements fade and slide in
- **Chat Message Animations**: Messages animate in with subtle bounce
- **Button Press Feedback**: Visual feedback on all interactive elements
- **Level Badge Rotation**: Spinning animation on onboarding
- **Progress Bars**: Animated progress indicators

## Advanced Features

### 16. **Milestone Management**
- **Visual Timeline**: Vertical timeline showing all milestones
- **Status Indicators**: Lock, Play, and Check icons for different states
- **Expand/Collapse**: Tap to view or hide milestone steps
- **Color Coding**: Active (primary), Completed (success), Locked (muted)
- **Celebration States**: Special UI for completed final milestones

### 17. **Subtask System**
- **Checkbox Interface**: Simple tap to toggle completion
- **Inline Creation**: "Add subtask" directly in step view
- **Edit/Delete**: Full CRUD operations on subtasks
- **Smart Defaults**: Steps can specify if subtasks should expand by default
- **Non-Blocking**: Subtask completion not required for step progression

### 18. **Resource Pins** (Data Model Ready)
- **Pin Types**: Links, notes, contacts, tools
- **Goal-Specific**: Each goal can have its own resource collection
- **Quick Access**: Keep important context close to relevant goals

### 19. **Recovery & Restart**
- **Goal Restart**: Single-action restart with option to make it easier
- **Restart Counter**: Tracks how many times a goal has been restarted
- **Historical Progress**: Previous completion data preserved
- **No Penalty**: Restarting doesn't affect points or level

### 20. **Weekly Analytics** (Premium)
- **Completion Time Tracking**: How long goals take to complete
- **Pattern Recognition**: Identify when you're most productive
- **Success Metrics**: Track completion rates and consistency
- **Data Export Ready**: Infrastructure for future analytics features

## Technical Features

### 21. **Type-Safe Development**
- **Full TypeScript**: Strict type checking throughout
- **Type Definitions**: Comprehensive interfaces for all data structures
- **Error Prevention**: Compile-time catching of potential bugs

### 22. **Cross-Platform Support**
- **iOS**: Full native support
- **Android**: Full native support
- **Web**: React Native Web compatibility with polyfills
- **Responsive**: Adapts to different screen sizes

### 23. **Performance Optimizations**
- **Lazy Loading**: Components load as needed
- **Memoization**: React.memo() for expensive components
- **Animated API**: Native driver for smooth 60fps animations
- **Efficient Storage**: Batched AsyncStorage operations

### 24. **Error Handling**
- **Graceful Failures**: Clear user-facing error messages
- **Network Resilience**: Works offline with sync-ready architecture
- **API Fallbacks**: Multiple error recovery paths
- **Debug Logging**: Comprehensive console logs for troubleshooting

### 25. **Accessibility Ready**
- **testID Props**: All interactive elements have test identifiers
- **Screen Reader Compatible**: Semantic HTML/native elements
- **Color Contrast**: WCAG-compliant color schemes
- **Touch Targets**: Minimum 44x44pt touch areas

## User Experience Features

### 26. **Smart Onboarding**
- **Conversational Flow**: Feels like talking to a coach, not filling a form
- **Progressive Disclosure**: Information revealed as needed
- **Single Goal Focus**: Gets user to first win quickly
- **Animated Branding**: Engaging visual introduction

### 27. **Empty States**
- **Encouraging Messages**: Positive tone, not guilt-inducing
- **Clear CTAs**: "Start Chat" button prominently displayed
- **Visual Interest**: Icons and illustrations keep UI alive

### 28. **Loading States**
- **Spinners**: Activity indicators during AI processing
- **Skeleton Screens**: Placeholder content while loading
- **Optimistic Updates**: UI updates before server confirmation

### 29. **Navigation**
- **Tab Bar**: 5 main sections (Goals, Chat, Leaderboard, Subscription, Settings)
- **Deep Linking**: Direct navigation to specific goals
- **Back Navigation**: Consistent back button behavior
- **Modal Screens**: Subscription flows as overlays

### 30. **Contextual Help**
- **"Need Help?" Buttons**: Context-aware chat entry points
- **Fallback Actions**: Alternative paths when primary route is blocked
- **Suggestion Prompts**: App proactively offers help when detecting struggles

## Quality of Life Features

### 31. **Automatic Name Capitalization**
- **Smart Formatting**: "john smith" becomes "John Smith"
- **Multi-Word Support**: Handles full names correctly
- **Respectful Processing**: Maintains user's intended spacing

### 32. **Real-Time Data**
- **Leaderboard Updates**: Dynamic ranking based on your actual progress
- **Live Point Calculations**: Immediate feedback on actions
- **Streak Tracking**: Daily reset at midnight

### 33. **Visual Polish**
- **Shadows & Elevation**: Depth and hierarchy throughout
- **Border Radius Consistency**: Unified design language
- **Icon Usage**: Lucide React Native icons for clarity
- **Color Psychology**: Primary colors convey action, success = green, danger = red

### 34. **Keyboard Handling**
- **Avoiding View**: Content shifts when keyboard appears
- **Auto-Scroll**: Chat scrolls to show new messages
- **Smart Focus**: Input fields gain focus at appropriate times
- **Submit on Return**: Natural chat-like behavior

### 35. **Safe Area Handling**
- **iOS Notch Support**: Content respects safe areas
- **Bottom Tab Spacing**: Proper padding for home indicator
- **Status Bar Awareness**: Content doesn't hide under system UI

## Coming Soon Features (Teasers in UI)

- **Weekly Prize Pool**: Competitions for top performers
- **Advanced Analytics**: Detailed insights into goal completion patterns
- **Social Features**: Share achievements, collaborative goals
- **AI Improvements**: More sophisticated plan generation

---

**Total Functional Features: 35+**
**Last Updated: January 2026**
**Version: 1.0.0**
