import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiFetch } from "../api";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function StatePostPage({ stateSlug, postSlug, states }) {
  const location = useLocation();
  const params = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("");

  const segments = location.pathname.split("/").filter(Boolean);
  const resolvedStateSlug =
    stateSlug || params.stateSlug || segments[0] || "";
  const resolvedPostSlug =
    postSlug || params.postSlug || segments[2] || "";

  const stateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      if (typeof state === "string") {
        return slugifyState(state) === resolvedStateSlug;
      }
      if (state?.slug) {
        return slugifyState(state.slug) === resolvedStateSlug;
      }
      if (state?.name) {
        return slugifyState(state.name) === resolvedStateSlug;
      }
      return false;
    });
    if (!match) return null;
    return typeof match === "string" ? match : match?.name || null;
  }, [resolvedStateSlug, states]);

  useEffect(() => {
    if (!resolvedStateSlug || !resolvedPostSlug) return;
    setStatus("");
    apiFetch(`/public/states/${resolvedStateSlug}/posts/${resolvedPostSlug}`)
      .then((data) => setPost(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [resolvedStateSlug, resolvedPostSlug]);

  const displayName =
    stateName ||
    resolvedStateSlug.charAt(0).toUpperCase() +
    resolvedStateSlug.slice(1).replace("-", " ");

  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handlePostComment = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);
    try {
      await apiFetch(`/public/states/${resolvedStateSlug}/posts/${resolvedPostSlug}/comments`, {
        method: "POST",
        body: JSON.stringify({
          name: commentName,
          email: commentEmail,
          content: commentBody,
        }),
      });
      // Refresh post to see new comment
      const data = await apiFetch(`/public/states/${resolvedStateSlug}/posts/${resolvedPostSlug}`);
      setPost(data.item || null);
      setCommentName("");
      setCommentEmail("");
      setCommentBody("");
      alert("Comment submitted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="public-home">
      <header className="public-nav">
        <Link className="public-brand" to="/">
          <div className="brand-mark">
            <img
              src="/logo.png"
              alt="DLCF"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div>
            <p className="brand-title">{displayName} State</p>
            <p className="brand-sub">Deeper Life Campus Fellowship</p>
          </div>
        </Link>
        <nav className="public-links">
          <Link to={`/${resolvedStateSlug}`}>State Home</Link>
          <Link to="/states">All States</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="blog-grid-hero blog-details-hero"
        style={{
          backgroundImage: post?.feature_image_url
            ? `linear-gradient(rgba(8, 20, 26, 0.85), rgba(16, 30, 40, 0.8)), url('${post.feature_image_url}')`
            : "linear-gradient(rgba(8, 20, 26, 0.85), rgba(16, 30, 40, 0.8)), url('/hero-image.jpg')",
        }}
      >
        <div className="blog-grid-hero-content">
          <h1 className="hero-title-large" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", maxWidth: "900px" }}>
            {post?.title || "Loading..."}
          </h1>
          <div className="hero-breadcrumb-pill">
            <Link to={`/${resolvedStateSlug}`}>Home</Link>
            <span>›</span>
            <Link to={`/${resolvedStateSlug}`}>Updates</Link>
            <span>›</span>
            <span className="current">{post?.title ? (post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title) : "Loading..."}</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="blog-details-container">
        {/* Left Column: Article */}
        <div className="blog-main-content">
          {status ? (
            <div className="post-error">
              <p>{status}</p>
              <Link className="public-btn ghost" to={`/${resolvedStateSlug}`}>
                Back to Updates
              </Link>
            </div>
          ) : !post ? (
            <div className="post-loading">
              <div className="loading-spinner"></div>
              <p>Loading article...</p>
            </div>
          ) : (
            <>
              {/* Featured Image */}
              {post.feature_image_url && (
                <div className="post-featured-image">
                  <img src={post.feature_image_url} alt={post.title} />
                </div>
              )}

              {/* Author & Meta */}
              <div className="blog-author-meta">
                <div className="meta-item">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || displayName)}&background=random`}
                    alt="Author"
                    className="author-avatar"
                  />
                  <div className="meta-text">
                    <span className="meta-label">Authored by</span>
                    <span className="meta-value">{post.author_name || `DLCF ${displayName} Ref`}</span>
                  </div>
                </div>
                <div className="meta-item" style={{ borderLeft: "1px solid #eee", paddingLeft: "24px" }}>
                  <div className="meta-text">
                    <span className="meta-label">Date Released</span>
                    <span className="meta-value">{formatDate(post.published_at)}</span>
                  </div>
                </div>
                <div className="meta-item" style={{ borderLeft: "1px solid #eee", paddingLeft: "24px" }}>
                  <div className="meta-text">
                    <span className="meta-label">Comments</span>
                    <span className="meta-value">{post.comments ? post.comments.length : 0} Comments</span>
                  </div>
                </div>
              </div>

              {/* Content body */}
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />

              {/* Article Footer */}
              <footer className="post-footer">
                <div className="post-share">
                  <span>Share this post:</span>
                  <div className="share-buttons">
                    <a href="#" className="share-btn">Twitter</a>
                    <a href="#" className="share-btn">Facebook</a>
                    <a href="#" className="share-btn">WhatsApp</a>
                  </div>
                </div>
              </footer>

              {/* Comments Section */}
              <div className="comments-section">
                <h3 className="comments-title">
                  Comments ({post.comments ? post.comments.length : 0})
                </h3>

                {/* Comment List */}
                <div className="comment-list">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=random`}
                          alt={comment.name}
                          className="comment-avatar"
                        />
                        <div className="comment-body">
                          <div className="comment-header">
                            <div>
                              <span className="comment-author">{comment.name}</span>
                              <span className="comment-date">{formatDate(comment.created_at)}</span>
                            </div>
                          </div>
                          <p style={{ color: "#555", margin: 0 }}>{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#666", fontStyle: "italic" }}>No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>

                {/* Comment Form */}
                <div style={{ marginTop: "40px", background: "#f9f9f9", padding: "24px", borderRadius: "16px", border: "1px solid #eee" }}>
                  <h4 style={{ margin: "0 0 20px", fontSize: "1.2rem" }}>Leave a Reply</h4>
                  <form onSubmit={handlePostComment} style={{ display: "grid", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <label style={{ display: "block" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666", marginBottom: "6px", display: "block" }}>Name</span>
                        <input
                          type="text"
                          required
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                        />
                      </label>
                      <label style={{ display: "block" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666", marginBottom: "6px", display: "block" }}>Email</span>
                        <input
                          type="email"
                          required
                          value={commentEmail}
                          onChange={(e) => setCommentEmail(e.target.value)}
                          style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                        />
                      </label>
                    </div>
                    <label style={{ display: "block" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666", marginBottom: "6px", display: "block" }}>Comment</span>
                      <textarea
                        required
                        rows="4"
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", resize: "vertical" }}
                      ></textarea>
                    </label>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="public-btn primary"
                      style={{ justifySelf: "start", marginTop: "8px" }}
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="blog-sidebar">
          {/* Search Widget */}
          <div className="sidebar-widget">
            <h3>Search Here</h3>
            <div className="sidebar-search">
              <input type="text" placeholder="Search here..." />
              <button>🔍</button>
            </div>
          </div>

          {/* Related Posts Widget (Real Data) */}
          <div className="sidebar-widget">
            <h3>Related Post</h3>
            <div className="sidebar-related-list">
              {post && post.related_posts && post.related_posts.length > 0 ? (
                post.related_posts.map((relatedPost) => (
                  <div key={relatedPost.slug} className="sidebar-related-item">
                    <div className="related-thumb">
                      <img
                        src={relatedPost.feature_image_url || `https://placehold.co/150x150?text=${encodeURIComponent(relatedPost.title.substring(0, 10))}`}
                        alt="Related Post"
                      />
                    </div>
                    <div className="related-info">
                      <span className="related-date">{formatDate(relatedPost.published_at)}</span>
                      <h4 className="related-title">
                        <Link to={`/${resolvedStateSlug}/updates/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h4>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#888", fontStyle: "italic", fontSize: "0.9rem" }}>No related posts found.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <footer className="post-page-footer">
        <p>© {new Date().getFullYear()} DLCF {displayName} State. All rights reserved.</p>
      </footer>
    </div>
  );
}

