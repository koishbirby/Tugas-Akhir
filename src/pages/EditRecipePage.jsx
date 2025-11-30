import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch existing post
  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setTitle(data.title);
        setContent(data.content);
      }
    }

    fetchPost();
  }, [id]);

  // Handle update
  async function handleSave() {
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title,
        content,
        updated_at: new Date(),
      })
      .eq("id", id);

    if (!error) {
      navigate(`/recipe/${id}`); // go back to detail page
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>

      {/* TITLE */}
      <label className="block mb-2 font-semibold">Title</label>
      <input
        className="w-full p-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* CONTENT */}
      <label className="block mb-2 font-semibold">Content</label>
      <textarea
        className="w-full p-3 border rounded h-60"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
