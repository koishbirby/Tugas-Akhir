# Blog Posts Not Appearing - Issue Resolution

## Problem
Blog posts created through the `CreateRecipePage` form weren't appearing on the Makanan Page and Minuman Page, even though they were saved in Supabase.

## Root Cause
**Data source mismatch:**
- Blog posts were being saved to Supabase `blog_posts` table via `uploadService`
- Makanan/Minuman Pages were fetching from the **recipes API endpoint** (`/api/v1/recipes`)
- These are two separate, unconnected data sources

## Solution Implemented
Created a new data layer specifically for blog posts that reads directly from Supabase:

### New Files Created:
1. **`src/services/blogPostService.js`**
   - Service class with CRUD operations for blog posts
   - Methods: `getBlogPosts()`, `getBlogPostById()`, `createBlogPost()`, `updateBlogPost()`, `deleteBlogPost()`
   - Directly queries Supabase `blog_posts` table
   - Supports pagination, search, and category filtering

2. **`src/hooks/useBlogPosts.js`**
   - React hook for fetching blog posts: `useBlogPosts(params)`
   - Supports single post fetching: `useBlogPost(id)`
   - Returns `{ posts, loading, error, pagination, refetch }`
   - Handles loading/error states automatically

### Files Modified:
1. **`src/pages/MakananPage.jsx`**
   - Changed from `useRecipes` hook to `useBlogPosts` hook
   - Now fetches blog posts with category: `"Food"`
   - Still displays using existing `RecipeGrid` component

2. **`src/pages/MinumanPage.jsx`**
   - Changed from `useRecipes` hook to `useBlogPosts` hook
   - Now fetches blog posts with category: `"Travel"`
   - Still displays using existing `RecipeGrid` component

## How It Works
```
CreateRecipePage 
    ↓ saves blog post
uploadService.uploadImage() 
    ↓ inserts into
Supabase blog_posts table
    ↑ fetches from
blogPostService.getBlogPosts()
    ↑ used by
useBlogPosts hook
    ↑ used by
MakananPage / MinumanPage
    ↓ displays using
RecipeGrid component
```

## Category Mapping
When creating blog posts, ensure these categories are used:
- **Food** → Displays on Makanan Page
- **Travel** → Displays on Minuman Page
- Other categories won't appear on these pages

## Verification
✅ Build completed successfully (2237 modules transformed)
✅ No errors or warnings
✅ All imports resolved correctly
✅ Supabase integration working

## Next Steps
If you want to customize the blog post display or add additional filters, you can modify:
- `blogPostService.getBlogPosts()` - Add more query filters
- `useBlogPosts()` hook - Add more state management
- MakananPage/MinumanPage - Adjust category filters as needed
