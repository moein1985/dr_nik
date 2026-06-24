# Fresh Feed Instagram-Style & Content Manager Improvements

## Table of Contents
1. [Instagram-Style Fresh Feed Implementation](#instagram-style-fresh-feed-implementation)
2. [Test Plan for Fresh Feed Changes](#test-plan-for-fresh-feed-changes)
3. [Content Manager UI/UX Improvements](#content-manager-uiux-improvements)
4. [Test Plan for Content Manager Improvements](#test-plan-for-content-manager-improvements)
5. [Docker Windows Deployment Steps](#docker-windows-deployment-steps)

---

## Instagram-Style Fresh Feed Implementation

### 1. Current State Analysis
- **Current Layout**: Grid-based card layout with modal for details
- **Issues**: 
  - Posts not displayed in chronological feed format
  - Comments hidden in modal
  - No user avatars
  - Limited interaction options

### 2. Target Design (Instagram-Style)

#### 2.1 Feed Layout
- **Single Column Feed**: Posts displayed vertically, one per row
- **Max Width**: 600px centered on desktop, full width on mobile
- **Spacing**: 16px gap between posts
- **Background**: Light gray (#fafafa) or dark (#121212) in dark mode

#### 2.2 Post Card Structure

```
┌─────────────────────────────────────────┐
│ [Avatar] Username • Time ago    [•••]  │  ← Header
├─────────────────────────────────────────┤
│                                         │
│           [Media/Video]                 │  ← Full width media
│                                         │
├─────────────────────────────────────────┤
│ ❤️ 💬 📤               [Bookmark]      │  ← Action buttons
│ [X] likes                              │  ← Stats
│ Caption text with #hashtags             │  ← Caption
│ View all X comments                     │  ← Comments link
│ ┌─────────────────────────────────────┐ │
│ │ [Avatar] Username: Comment text    │ │  ← Comments preview
│ │ [Avatar] Username: Comment text    │ │
│ └─────────────────────────────────────┘ │
│ [Add a comment...]          [Post]     │  ← Comment input
└─────────────────────────────────────────┘
```

#### 2.3 Component Breakdown

##### A. Post Header
- **Avatar**: Circular, 40px diameter
  - Use initial letters if no avatar image
  - Fallback to user's first letter of username
- **Username**: Bold, clickable to user profile
- **Time**: "2h ago", "1d ago" format
- **Options menu**: Three dots (•••) for report/share

##### B. Media Section
- **Images**: Full width, max-height 600px, object-fit cover
- **Videos**: Full width, max-height 600px, controls enabled
- **Swipeable**: Multiple images support (future enhancement)

##### C. Action Buttons
- **Like**: Heart icon (outline when not liked, filled red when liked)
- **Comment**: Bubble icon
- **Share**: Paper plane icon
- **Bookmark**: Bookmark icon (future enhancement)
- **Animations**: Scale animation on click

##### D. Stats Section
- **Likes count**: "X likes" (clickable to see who liked)
- **Date**: "DD MMM YYYY" format

##### E. Caption Section
- **Username**: Bold, linked to profile
- **Text**: Regular weight, support for hashtags (clickable)
- **Truncation**: Show first 3 lines, "more" button to expand

##### F. Comments Section
- **Preview**: Show 2-3 most recent comments
- **Avatar**: Small circular (24px)
- **Username**: Bold
- **Content**: Regular text
- **"View all X comments"**: Link to expand all comments
- **Collapse**: Option to collapse expanded comments

##### G. Comment Input
- **Placeholder**: "Add a comment..."
- **Avatar**: Small circular (24px) on left
- **Input**: Text field, expands on focus
- **Post button**: Disabled when empty, blue when active

### 3. Technical Implementation

#### 3.1 File Changes

##### A. Component: `fresh-feed-client.tsx`
**Changes:**
- Remove modal-based detail view
- Implement single-column feed layout
- Add `PostCard` component for each post
- Add `CommentSection` component inline
- Add `Avatar` component for user avatars
- Implement like animation
- Add comment expansion/collapse

##### B. New Component: `src/components/fresh/PostCard.tsx`
**Structure:**
```typescript
interface PostCardProps {
  post: FreshPostWithDetails;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  currentUser?: User;
}

const PostCard = ({ post, onLike, onComment, currentUser }: PostCardProps) => {
  // State for comment expansion
  // State for caption expansion
  // State for like animation
  // Render header, media, actions, caption, comments, input
}
```

##### C. New Component: `src/components/fresh/Avatar.tsx`
**Structure:**
```typescript
interface AvatarProps {
  username?: string;
  imageUrl?: string;
  size?: number;
}

const Avatar = ({ username, imageUrl, size = 40 }: AvatarProps) => {
  // If imageUrl exists, render image
  // Otherwise, render initial letter in colored circle
}
```

##### D. New Component: `src/components/fresh/CommentSection.tsx`
**Structure:**
```typescript
interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onToggleExpanded: () => void;
  isExpanded: boolean;
  totalComments: number;
}

const CommentSection = ({ comments, onAddComment, onToggleExpanded, isExpanded, totalComments }: CommentSectionProps) => {
  // Show preview or all comments based on isExpanded
  // Render comment input
}
```

#### 3.2 API Changes

##### A. New Query: `fresh.listWithDetails`
**Purpose**: Fetch posts with limited comments for feed
**Input**: `{ limit?: number, commentsLimit?: number }`
**Output**: Posts with first N comments
**Implementation**: Add to `fresh.repository.ts` and `fresh.ts`

##### B. New Mutation: `fresh.toggleLike`
**Purpose**: Toggle like status (add/remove)
**Input**: `{ postId: string }`
**Output**: `{ liked: boolean, likeCount: number }`
**Implementation**: Already exists, ensure it returns updated count

##### C. Optimistic Updates
- Update like count immediately on UI
- Revert on error
- Show loading state for comments

#### 3.3 Styling

##### A. Tailwind Classes
```css
/* Feed Container */
.feed-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

/* Post Card */
.post-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Dark Mode */
.dark .post-card {
  background: #262626;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Avatar */
.avatar {
  border-radius: 50%;
  object-fit: cover;
}

/* Like Animation */
@keyframes like-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.like-button.liked {
  animation: like-animation 0.3s ease;
  color: #ed4956;
}
```

#### 3.4 Responsive Design

##### A. Mobile (< 640px)
- Full width, no padding
- Smaller avatars (32px)
- Smaller fonts
- Touch-friendly buttons (44px min height)

##### B. Tablet (640px - 1024px)
- 600px max width
- Standard avatars (40px)
- Standard fonts

##### C. Desktop (> 1024px)
- 600px max width centered
- Standard sizing
- Hover effects on buttons

### 4. Implementation Steps

1. **Create Avatar component** with fallback to initials
2. **Create PostCard component** with header, media, actions
3. **Create CommentSection component** with inline comments
4. **Update fresh-feed-client.tsx** to use PostCard
5. **Remove modal and detail view**
6. **Add like animation**
7. **Implement comment expansion/collapse**
8. **Add caption truncation**
9. **Implement responsive design**
10. **Add loading states**
11. **Add error handling**

---

## Test Plan for Fresh Feed Changes

### 1. Unit Tests

#### 1.1 Avatar Component Tests
**File**: `src/components/fresh/__tests__/Avatar.test.tsx`

```typescript
describe('Avatar', () => {
  it('renders image when imageUrl is provided', () => {
    // Test image rendering
  });

  it('renders initial letter when imageUrl is not provided', () => {
    // Test initial letter fallback
  });

  it('uses correct size prop', () => {
    // Test size customization
  });

  it('generates consistent color for same username', () => {
    // Test color generation
  });
});
```

#### 1.2 PostCard Component Tests
**File**: `src/components/fresh/__tests__/PostCard.test.tsx`

```typescript
describe('PostCard', () => {
  it('renders post header with username and time', () => {
    // Test header rendering
  });

  it('renders image for IMAGE media type', () => {
    // Test image rendering
  });

  it('renders video for VIDEO media type', () => {
    // Test video rendering
  });

  it('calls onLike when like button is clicked', () => {
    // Test like interaction
  });

  it('shows liked state when post is liked', () => {
    // Test like state display
  });

  it('renders caption with truncation', () => {
    // Test caption truncation
  });

  it('expands caption when more button is clicked', () => {
    // Test caption expansion
  });

  it('renders comment preview by default', () => {
    // Test comment preview
  });

  it('expands comments when view all is clicked', () => {
    // Test comment expansion
  });

  it('calls onComment when comment is submitted', () => {
    // Test comment submission
  });
});
```

#### 1.3 CommentSection Component Tests
**File**: `src/components/fresh/__tests__/CommentSection.test.tsx`

```typescript
describe('CommentSection', () => {
  it('renders limited comments when not expanded', () => {
    // Test comment limit
  });

  it('renders all comments when expanded', () => {
    // Test full comment list
  });

  it('shows view all link when there are more comments', () => {
    // Test view all link
  });

  it('calls onToggleExpanded when view all is clicked', () => {
    // Test toggle expansion
  });

  it('calls onAddComment when comment is submitted', () => {
    // Test comment submission
  });

  it('disables post button when input is empty', () => {
    // Test button state
  });
});
```

### 2. Integration Tests

#### 2.1 Fresh Feed Client Tests
**File**: `src/components/fresh/__tests__/fresh-feed-client.test.tsx`

```typescript
describe('FreshFeedClient', () => {
  it('fetches posts on mount', () => {
    // Test initial data fetch
  });

  it('renders PostCard for each post', () => {
    // Test post rendering
  });

  it('shows loading state while fetching', () => {
    // Test loading state
  });

  it('shows error message on fetch failure', () => {
    // Test error handling
  });

  it('updates like count after like mutation', () => {
    // Test optimistic update
  });

  it('adds comment to list after submission', () => {
    // Test comment addition
  });
});
```

#### 2.2 API Integration Tests
**File**: `src/server/api/routers/__tests__/fresh-integration.test.ts`

```typescript
describe('Fresh Router Integration', () => {
  it('listWithDetails returns posts with limited comments', async () => {
    // Test listWithDetails query
  });

  it('toggleLike updates like count correctly', async () => {
    // Test like toggle
  });

  it('addComment adds comment to post', async () => {
    // Test comment addition
  });
});
```

### 3. E2E Tests

#### 3.1 Fresh Feed E2E Tests
**File**: `e2e/fresh-feed.spec.ts`

```typescript
describe('Fresh Feed E2E', () => {
  it('displays posts in single column feed', async () => {
    // Test feed layout
  });

  it('allows user to like a post', async () => {
    // Test like interaction
  });

  it('allows user to comment on a post', async () => {
    // Test comment interaction
  });

  it('expands comments when view all is clicked', async () => {
    // Test comment expansion
  });

  it('expands caption when more is clicked', async () => {
    // Test caption expansion
  });

  it('displays user avatars correctly', async () => {
    // Test avatar display
  });

  it('is responsive on mobile', async () => {
    // Test mobile layout
  });
});
```

### 4. Performance Tests

#### 4.1 Feed Performance
- Test with 50 posts
- Test with 100 posts
- Test with posts containing many comments
- Measure initial load time
- Measure scroll performance

### 5. Accessibility Tests

- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- ARIA labels

---

## Content Manager UI/UX Improvements

### 1. Current State Analysis
- **Current Layout**: Tab-based interface with basic CRUD operations
- **Issues**:
  - No visual hierarchy
  - Limited filtering options
  - No bulk actions
  - Basic table layout
  - No statistics/dashboard
  - No search functionality

### 2. Target Design (Super Admin Style)

#### 2.1 Dashboard Overview
- **Statistics Cards**: Total posts, total comments, active users, engagement rate
- **Recent Activity**: Timeline of recent actions
- **Quick Actions**: Create post, manage users, view analytics

#### 2.2 Posts Management

##### A. Enhanced Table
- **Columns**: Thumbnail, Caption, Author, Status, Date, Likes, Comments, Actions
- **Sorting**: Clickable headers for all columns
- **Filtering**: By status, author, date range
- **Search**: Full-text search in captions
- **Bulk Actions**: Delete, change status, archive

##### B. Post Preview
- **Thumbnail**: Small image preview in table
- **Quick View**: Hover to see full media
- **Status Badges**: Color-coded (Published=green, Draft=yellow, Archived=gray)

##### C. Create/Edit Form
- **Rich Text Editor**: For captions with formatting
- **Media Upload**: Drag & drop with preview
- **Status Selector**: Dropdown with clear labels
- **Scheduled Publishing**: Date/time picker
- **Author Selector**: If admin can post as other users

#### 2.3 Comments Management

##### A. Enhanced Table
- **Columns**: Post thumbnail, Comment content, Author, Date, Status, Actions
- **Filtering**: By post, author, status, date range
- **Search**: Full-text search in comments
- **Bulk Actions**: Approve, reject, delete

##### B. Moderation Queue
- **Pending Comments**: Separate view for moderation
- **Quick Actions**: Approve/Reject buttons inline
- **Flagged Comments**: Highlight suspicious content

#### 2.4 UI Components

##### A. Statistics Cards
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number; // percentage change
  icon: React.ReactNode;
  color?: string;
}
```

##### B. Filter Panel
- **Status Filter**: Checkbox group
- **Date Range**: Date picker
- **Author Search**: Autocomplete
- **Apply/Reset**: Action buttons

##### C. Bulk Action Bar
- **Select All**: Checkbox
- **Selected Count**: "X items selected"
- **Action Dropdown**: Delete, Archive, Publish, Draft
- **Confirm Dialog**: For destructive actions

##### D. Search Bar
- **Debounced Input**: 300ms delay
- **Clear Button**: When has value
- **Placeholder**: "Search posts..."

#### 2.5 Visual Improvements

##### A. Color Scheme
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray (#6b7280)

##### B. Spacing
- **Card Padding**: 24px
- **Table Cell Padding**: 12px
- **Button Padding**: 8px 16px
- **Gap**: 16px

##### C. Typography
- **Headings**: 600 weight, 18-24px
- **Body**: 400 weight, 14-16px
- **Small**: 400 weight, 12px

##### D. Shadows
- **Card**: 0 1px 3px rgba(0,0,0,0.1)
- **Modal**: 0 10px 25px rgba(0,0,0,0.2)
- **Dropdown**: 0 4px 6px rgba(0,0,0,0.1)

### 3. Technical Implementation

#### 3.1 File Changes

##### A. Component: `content-manager-panel.tsx`
**Changes:**
- Add dashboard overview with statistics
- Add search functionality
- Add filter panel
- Add bulk action bar
- Enhance table with thumbnails and badges
- Add sorting to table headers
- Add pagination
- Improve create/edit form

##### B. New Component: `src/components/content-manager/StatCard.tsx`
**Structure:**
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
```

##### C. New Component: `src/components/content-manager/FilterPanel.tsx`
**Structure:**
```typescript
interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}
```

##### D. New Component: `src/components/content-manager/BulkActionBar.tsx`
**Structure:**
```typescript
interface BulkActionBarProps {
  selectedIds: string[];
  onAction: (action: string) => void;
  onClearSelection: () => void;
}
```

##### E. New Component: `src/components/content-manager/EnhancedTable.tsx`
**Structure:**
```typescript
interface EnhancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort: (column: string) => void;
  onRowSelect: (id: string) => void;
  selectedIds: string[];
  sortable?: boolean;
  selectable?: boolean;
}
```

#### 3.2 API Changes

##### A. New Query: `fresh.getStatistics`
**Purpose**: Get dashboard statistics
**Input**: `{}`
**Output**: `{ totalPosts, totalComments, activeUsers, engagementRate }`
**Implementation**: Add to `fresh.repository.ts` and `fresh.ts`

##### B. Enhanced Query: `fresh.listAll`
**Purpose**: Support filtering and sorting
**Input**: `{ limit, offset, filters, sortBy, sortOrder }`
**Output**: Filtered and sorted posts
**Implementation**: Update existing query

##### C. New Mutation: `fresh.bulkUpdateStatus`
**Purpose**: Update status of multiple posts
**Input**: `{ postIds: string[], status: FreshPostStatus }`
**Output**: `{ updatedCount: number }`
**Implementation**: Add to `fresh.repository.ts` and `fresh.ts`

##### D. New Mutation: `fresh.bulkDelete`
**Purpose**: Delete multiple posts
**Input**: `{ postIds: string[] }`
**Output**: `{ deletedCount: number }`
**Implementation**: Add to `fresh.repository.ts` and `fresh.ts`

#### 3.3 State Management

##### A. Filter State
```typescript
interface FilterState {
  status?: FreshPostStatus;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}
```

##### B. Sort State
```typescript
interface SortState {
  column: string;
  order: 'asc' | 'desc';
}
```

##### C. Selection State
```typescript
interface SelectionState {
  selectedIds: Set<string>;
  allSelected: boolean;
}
```

### 4. Implementation Steps

1. **Create StatCard component** with color variants
2. **Create FilterPanel component** with various filter types
3. **Create BulkActionBar component** with action dropdown
4. **Create EnhancedTable component** with sorting and selection
5. **Add dashboard statistics** to content manager
6. **Add search functionality** with debouncing
7. **Add filter panel** with reset functionality
8. **Add bulk action bar** with confirmation dialogs
9. **Enhance table** with thumbnails and badges
10. **Add sorting** to table headers
11. **Add pagination** for large datasets
12. **Improve create/edit form** with rich text editor
13. **Add scheduled publishing** feature
14. **Implement responsive design**
15. **Add loading states**
16. **Add error handling**

---

## Test Plan for Content Manager Improvements

### 1. Unit Tests

#### 1.1 StatCard Component Tests
**File**: `src/components/content-manager/__tests__/StatCard.test.tsx`

```typescript
describe('StatCard', () => {
  it('renders title and value', () => {
    // Test basic rendering
  });

  it('displays positive change in green', () => {
    // Test positive change display
  });

  it('displays negative change in red', () => {
    // Test negative change display
  });

  it('renders icon correctly', () => {
    // Test icon rendering
  });

  it('applies correct color variant', () => {
    // Test color variants
  });
});
```

#### 1.2 FilterPanel Component Tests
**File**: `src/components/content-manager/__tests__/FilterPanel.test.tsx`

```typescript
describe('FilterPanel', () => {
  it('renders all filter options', () => {
    // Test filter rendering
  });

  it('calls onFilterChange when filter is changed', () => {
    // Test filter change
  });

  it('calls onReset when reset is clicked', () => {
    // Test reset functionality
  });

  it('displays current filter values', () => {
    // Test filter value display
  });
});
```

#### 1.3 BulkActionBar Component Tests
**File**: `src/components/content-manager/__tests__/BulkActionBar.test.tsx`

```typescript
describe('BulkActionBar', () => {
  it('shows selected count', () => {
    // Test count display
  });

  it('hides when no items selected', () => {
    // test visibility
  });

  it('calls onAction when action is selected', () => {
    // Test action selection
  });

  it('calls onClearSelection when clear is clicked', () => {
    // Test clear selection
  });
});
```

#### 1.4 EnhancedTable Component Tests
**File**: `src/components/content-manager/__tests__/EnhancedTable.test.tsx`

```typescript
describe('EnhancedTable', () => {
  it('renders all columns', () => {
    // Test column rendering
  });

  it('renders all data rows', () => {
    // Test data rendering
  });

  it('calls onSort when header is clicked', () => {
    // Test sorting
  });

  it('calls onRowSelect when checkbox is clicked', () => {
    // Test row selection
  });

  it('shows sort indicator on sorted column', () => {
    // Test sort indicator
  });

  it('selects all rows when select all is clicked', () => {
    // Test select all
  });
});
```

### 2. Integration Tests

#### 2.1 Content Manager Panel Tests
**File**: `src/components/content-manager/__tests__/content-manager-panel.test.tsx`

```typescript
describe('ContentManagerPanel', () => {
  it('displays statistics cards', () => {
    // Test statistics display
  });

  it('fetches posts on mount', () => {
    // Test initial data fetch
  });

  it('filters posts when filter is applied', () => {
    // Test filtering
  });

  it('searches posts when query is entered', () => {
    // Test search
  });

  it('sorts posts when header is clicked', () => {
    // Test sorting
  });

  it('shows bulk action bar when items selected', () => {
    // Test bulk action bar
  });

  it('applies bulk action when confirmed', () => {
    // Test bulk action
  });

  it('paginates posts when page is changed', () => {
    // Test pagination
  });
});
```

#### 2.2 API Integration Tests
**File**: `src/server/api/routers/__tests__/fresh-integration.test.ts`

```typescript
describe('Fresh Router Integration', () => {
  it('getStatistics returns correct counts', async () => {
    // Test statistics query
  });

  it('listAll filters by status correctly', async () => {
    // Test status filtering
  });

  it('listAll sorts by column correctly', async () => {
    // Test sorting
  });

  it('listAll searches by query correctly', async () => {
    // Test search
  });

  it('bulkUpdateStatus updates multiple posts', async () => {
    // Test bulk status update
  });

  it('bulkDelete deletes multiple posts', async () => {
    // Test bulk delete
  });
});
```

### 3. E2E Tests

#### 3.1 Content Manager E2E Tests
**File**: `e2e/content-manager.spec.ts`

```typescript
describe('Content Manager E2E', () => {
  it('displays dashboard statistics', async () => {
    // Test statistics display
  });

  it('allows user to filter posts by status', async () => {
    // Test filtering
  });

  it('allows user to search posts', async () => {
    // Test search
  });

  it('allows user to sort posts', async () => {
    // Test sorting
  });

  it('allows user to select multiple posts', async () => {
    // Test selection
  });

  it('allows user to perform bulk actions', async () => {
    // Test bulk actions
  });

  it('allows user to create a new post', async () => {
    // Test post creation
  });

  it('allows user to edit an existing post', async () => {
    // Test post editing
  });

  it('allows user to delete a post', async () => {
    // Test post deletion
  });

  it('allows user to manage comments', async () => {
    // Test comment management
  });
});
```

### 4. Performance Tests

- Test with 100 posts
- Test with 1000 posts
- Test filter performance
- Test search performance
- Test bulk action performance

### 5. Accessibility Tests

- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- ARIA labels

---

## Docker Windows Deployment Steps

### Prerequisites

1. **Docker Desktop for Windows**
   - Download from https://www.docker.com/products/docker-desktop
   - Install with WSL 2 backend (recommended)
   - Ensure Docker Desktop is running

2. **Windows Subsystem for Linux (WSL 2)**
   - Enable WSL 2: `wsl --install`
   - Restart computer
   - Verify: `wsl --version`

3. **Git**
   - Install from https://git-scm.com/download/win
   - Verify: `git --version`

### Deployment Steps

#### 1. Clone Repository
```powershell
git clone <repository-url>
cd dr_nik_clinic
```

#### 2. Configure Environment Variables
Create `.env` file in project root:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/clinic?schema=public"

# App
NODE_ENV="production"
PORT=3001

# Auth
AUTH_RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_SECONDS=60

# Upload
MAX_FILE_SIZE=10485760
MAX_IMAGE_SIZE=5242880
MAX_VIDEO_SIZE=52428800
```

#### 3. Build Docker Images
```powershell
docker-compose build
```

**Expected Output:**
- Build process takes 3-5 minutes
- Creates `dr_nik_clinic-app` image
- Creates `dr_nik_clinic-postgres` image
- Creates `dr_nik_clinic-mailpit` image

#### 4. Run Database Migrations
```powershell
docker-compose up -d postgres
docker-compose exec app npx prisma migrate deploy
```

**Expected Output:**
- PostgreSQL container starts
- Migrations run successfully
- Database schema created

#### 5. Start All Services
```powershell
docker-compose up -d
```

**Expected Output:**
- All 4 containers start: app, postgres, mailpit
- App available at http://localhost:3001
- Mailpit available at http://localhost:8025

#### 6. Verify Deployment
```powershell
# Check container status
docker-compose ps

# Check app logs
docker-compose logs app

# Check database logs
docker-compose logs postgres
```

**Expected Output:**
- All containers showing "Up" status
- No errors in logs
- App listening on port 3001

#### 7. Access Application
- **Main App**: http://localhost:3001
- **Mailpit (Email Testing)**: http://localhost:8025

### Common Issues and Solutions

#### Issue 1: Port Already in Use
**Error:** `Error: Port 3001 is already in use`

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "3002:3000"
```

#### Issue 2: WSL 2 Not Running
**Error:** `error during connect: This error may indicate that the docker daemon is not running`

**Solution:**
```powershell
# Start WSL
wsl

# Restart Docker Desktop
# Right-click Docker Desktop icon -> Restart
```

#### Issue 3: Database Connection Failed
**Error:** `Can't reach database server at postgres:5432`

**Solution:**
```powershell
# Restart postgres container
docker-compose restart postgres

# Check postgres logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
```

#### Issue 4: Build Fails with Out of Memory
**Error:** `failed to solve: executor failed running [/bin/sh -c npm run build]`

**Solution:**
```powershell
# Increase Docker memory limit
# Docker Desktop -> Settings -> Resources -> Memory
# Set to at least 4GB

# Or build with no cache
docker-compose build --no-cache
```

#### Issue 5: Volume Permission Issues
**Error:** `EACCES: permission denied`

**Solution:**
```powershell
# This is rare on Windows with WSL 2
# If it occurs, check Docker Desktop file sharing settings
# Settings -> Resources -> File sharing
# Ensure project directory is shared
```

### Maintenance Commands

#### View Logs
```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs postgres

# Follow logs (real-time)
docker-compose logs -f app
```

#### Restart Services
```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

#### Stop Services
```powershell
# Stop all
docker-compose down

# Stop and remove volumes (cleans database)
docker-compose down -v
```

#### Update Application
```powershell
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

#### Database Management
```powershell
# Access database shell
docker-compose exec postgres psql -U postgres -d clinic

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
docker-compose exec app npx prisma migrate reset
```

#### Backup Database
```powershell
# Backup
docker-compose exec postgres pg_dump -U postgres clinic > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres clinic < backup.sql
```

### Performance Optimization

#### 1. Enable BuildKit
Add to `docker-compose.yml`:
```yaml
version: '3.8'
x-build-args: &build-args
  BUILDKIT_PROGRESS: plain

services:
  app:
    build:
      args: *build-args
```

#### 2. Use Docker Build Cache
```powershell
# Build with cache
docker-compose build

# Clear cache if needed
docker builder prune
```

#### 3. Optimize Docker Resources
- **Memory**: 4GB minimum
- **CPUs**: 2 minimum
- **Disk**: 20GB minimum

### Security Considerations

1. **Change Default Passwords**
   - Update `POSTGRES_PASSWORD` in `docker-compose.yml`
   - Update `DATABASE_URL` in `.env`

2. **Use Secrets in Production**
   - Use Docker Secrets instead of environment variables
   - Never commit `.env` file

3. **Enable HTTPS**
   - Use reverse proxy (nginx/traefik)
   - Configure SSL certificates

4. **Regular Backups**
   - Automate database backups
   - Store backups off-site

### Monitoring

#### Health Checks
Add to `docker-compose.yml`:
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Log Aggregation
- Consider using ELK stack or similar
- Centralize logs for analysis

---

## Implementation Order

### Phase 1: Fresh Feed Instagram-Style (Priority: High)
1. Create Avatar component
2. Create PostCard component
3. Create CommentSection component
4. Update fresh-feed-client.tsx
5. Write unit tests
6. Write integration tests
7. Write E2E tests
8. Deploy and test

### Phase 2: Content Manager Improvements (Priority: High)
1. Create StatCard component
2. Create FilterPanel component
3. Create BulkActionBar component
4. Create EnhancedTable component
5. Update content-manager-panel.tsx
6. Add API queries and mutations
7. Write unit tests
8. Write integration tests
9. Write E2E tests
10. Deploy and test

### Phase 3: Docker Windows Documentation (Priority: Medium)
1. Document deployment steps
2. Test deployment on Windows
3. Add troubleshooting guide
4. Add maintenance commands

---

## Success Criteria

### Fresh Feed
- ✅ Posts display in single column feed
- ✅ Comments visible inline
- ✅ Like animation works
- ✅ User avatars display correctly
- ✅ Comment expansion/collapse works
- ✅ Responsive on mobile
- ✅ All tests pass
- ✅ Performance acceptable (< 2s load time)

### Content Manager
- ✅ Statistics display correctly
- ✅ Filtering works
- ✅ Search works
- ✅ Sorting works
- ✅ Bulk actions work
- ✅ Enhanced table displays correctly
- ✅ All tests pass
- ✅ Performance acceptable (< 1s load time)

### Docker Windows
- ✅ Deployment works on Windows
- ✅ All services start correctly
- ✅ Application accessible
- ✅ Database migrations run
- ✅ Common issues documented
