/**
 * Map blog post objects to recipe shape for RecipeGrid components
 * Blog posts have: id, title, content, excerpt, author, category, created_at
 * RecipeGrid expects: id, image_url, name, prep_time, difficulty, average_rating
 * 
 * This adapter fills in missing fields with sensible defaults
 */
export function mapBlogPostToRecipe(blogPost) {
  if (!blogPost) return null;

  return {
    id: blogPost.id,
    name: blogPost.title || 'Untitled',
    // Use placeholder or extract from excerpt if available
    image_url: blogPost.image_url || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(blogPost.title || 'Recipe'),
    // Default values for fields not in blog posts
    prep_time: blogPost.prep_time || '30 min',
    difficulty: blogPost.difficulty || 'Medium',
    average_rating: blogPost.average_rating || 0,
    // Keep blog post fields for reference
    title: blogPost.title,
    content: blogPost.content,
    excerpt: blogPost.excerpt,
    author: blogPost.author,
    category: blogPost.category,
    created_at: blogPost.created_at
  };
}

/**
 * Map an array of blog posts to recipe shape
 */
export function mapBlogPostsToRecipes(blogPosts) {
  if (!Array.isArray(blogPosts)) return [];
  return blogPosts.map(mapBlogPostToRecipe);
}
