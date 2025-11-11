# EnerJee Design Guidelines

## Design Approach
**Reference-Based Approach**: Draw inspiration from modern energy/data platforms like Tesla Energy Dashboard and Notion's clean interface, combined with data visualization excellence from Linear and modern SaaS aesthetics.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter or Poppins (Google Fonts)
- **Headings**: Bold weights (600-700), larger sizes for dashboard titles
- **Body Text**: Regular weight (400), comfortable reading size
- **Data/Metrics**: Tabular nums, medium weight (500) for emphasis

### B. Color System
- **Primary Teal**: #167a5f (buttons, links, highlights, energy branding)
- **Sage Accent**: #9bb89f (CTAs, important metrics, energy indicators)
- **Cream Background**: #edeae1 (main background)
- **White Cards**: #FFFFFF (card backgrounds for contrast)
- **Neutral Grays**: Light grays for borders, subtle backgrounds
- **Success Green**: For positive metrics (renewable %, emission savings)
- **Warning Red**: For cost increases or alerts

### C. Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 (p-4, m-6, gap-8, etc.)

**Page Structure**:
1. **Login/Signup Page**: Centered card layout with clean form fields, white card on subtle gradient background
2. **Main Dashboard**: Two-pane split layout
   - Left sidebar: Fixed width (280-320px), white background, subtle shadow
   - Main content: Flexible width, light gray background (#F8F9FA)

### D. Component Library

**Navigation & Layout**:
- Collapsible left sidebar with smooth transitions
- Top header bar with user info and logout option
- Section dividers with subtle lines

**Form Controls** (Left Panel):
- **Dropdowns**: White background, teal border on focus, rounded corners (rounded-lg)
- **Radio Buttons**: Teal fill when selected, sage accent for energy priority options
- **Sliders**: Teal track, sage thumb, clear value labels
- **Primary Button ("Run Optimization")**: Teal background (#167a5f), white text, rounded, prominent shadow on hover

**Data Display** (Main Area):
- **Results Table**: Clean bordered table, alternating row backgrounds, teal header row
- **Cards**: White background, subtle shadow (shadow-md), rounded corners (rounded-xl)
- **Metrics Display**: Large numbers with labels, color-coded (teal for cost, green for renewables)

**Charts** (using Chart.js/Plotly):
- **Energy Mix Graph**: Stacked area chart with distinct colors (Solar: yellow-orange, Wind: sky blue, Hydro: teal), demand line in dark gray
- **Price Analysis**: Line chart with two lines (baseline: red, optimized: green)
- **Emission Reduction**: Donut or pie chart with green for savings, gray for baseline

**Chat Interface**:
- Chat window at bottom of main area with white background
- User messages: Teal background bubbles (align right)
- AI responses: Light gray bubbles (align left)
- Input field: White with teal border, sage send button

**Special Features**:
- Rotating Earth animation: Small animated globe icon when showing renewable improvements
- Export Report button: Teal outline button with download icon

### E. Interactive States
- Hover: Subtle scale (scale-105) or shadow increase
- Active/Focus: Teal outline for accessibility
- Loading: Teal spinner or skeleton screens
- Disabled: Reduced opacity (opacity-50)

### F. Spacing & Rhythm
- Card padding: p-6 or p-8
- Section gaps: gap-6 to gap-8
- Form field spacing: space-y-4
- Dashboard margins: Sidebar 0 margin, main content p-8

### G. Visual Hierarchy
1. **High Priority**: Run Optimization button, key metrics, chart titles
2. **Medium Priority**: Form labels, table headers, sub-metrics
3. **Low Priority**: Helper text, footnotes, timestamps

## Images
**No hero images required** - This is a dashboard/tool application focused on data visualization and functionality. The visual interest comes from charts, graphs, and the clean interface rather than photography.

## Accessibility
- High contrast ratios for all text
- Clear focus indicators (blue outline)
- Aria labels for all interactive elements
- Keyboard navigation support for all controls

## Animation Strategy
**Minimal, purposeful animations**:
- Sidebar collapse/expand transition (300ms ease)
- Chart data transitions when updating
- Rotating Earth globe (slow, continuous rotation)
- Button hover effects (subtle scale)
- No distracting page transitions or scroll effects