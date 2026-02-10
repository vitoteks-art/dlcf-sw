import { useEffect } from "react";
import RichTextEditor from "../RichTextEditor";

export default function AdminStatePosts({
  user,
  stateOptions,
  adminCategories,
  setStatus,
  adminStatePosts,
  adminStatePostState,
  setAdminStatePostState,
  adminStatePostTitle,
  setAdminStatePostTitle,
  adminStatePostType,
  setAdminStatePostType,
  adminStatePostStatus,
  setAdminStatePostStatus,
  adminStatePostPublishedAt,
  setAdminStatePostPublishedAt,
  adminStatePostFeatureImage,
  setAdminStatePostFeatureImage,
  adminStatePostContent,
  setAdminStatePostContent,
  adminStatePostCategoryIds,
  setAdminStatePostCategoryIds,
  adminStatePostEditId,
  setAdminStatePostEditId,
  loadAdminStatePosts,
  handleAddStatePost,
  handleEditStatePost,
  handleDeleteStatePost,
  uploadImage,
}) {
  const isEditing = !!adminStatePostEditId;
  const isStateAdmin =
    user && (user.role === "state_cord" || user.role === "state_admin");
  const canSelectState = !isStateAdmin || !user?.state;

  useEffect(() => {
    if (!adminStatePostState) return;
    loadAdminStatePosts(adminStatePostState);
  }, [adminStatePostState, loadAdminStatePosts]);

  const resetForm = () => {
    setAdminStatePostEditId("");
    setAdminStatePostTitle("");
    setAdminStatePostType("");
    setAdminStatePostStatus("draft");
    setAdminStatePostPublishedAt("");
    setAdminStatePostFeatureImage("");
    setAdminStatePostContent("");
    setAdminStatePostCategoryIds([]);
  };

  const toggleCategory = (id) => {
    setAdminStatePostCategoryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>State Updates</h3>
      </div>

      <div className="panel-content">
        <div className="form-card card">
          <h4>{isEditing ? "Edit Update" : "Add New Update"}</h4>
          <form
            onSubmit={isEditing ? handleEditStatePost : handleAddStatePost}
            className="form compact-form"
          >
            <div className="grid-2">
              <label>
                State
                <select
                  value={adminStatePostState}
                  onChange={(e) => setAdminStatePostState(e.target.value)}
                  required
                  disabled={!canSelectState}
                >
                  <option value="">Select state</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <input
                  type="text"
                  value={adminStatePostType}
                  onChange={(e) => setAdminStatePostType(e.target.value)}
                  placeholder="Evangelism, Comic, Program"
                  required
                />
              </label>
            </div>
            <label>
              Title
              <input
                type="text"
                value={adminStatePostTitle}
                onChange={(e) => setAdminStatePostTitle(e.target.value)}
                required
              />
            </label>
            <div className="grid-2">
              <label>
                Feature Image URL
                <input
                  type="text"
                  value={adminStatePostFeatureImage}
                  onChange={(e) => setAdminStatePostFeatureImage(e.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label>
                Upload Feature Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const url = await uploadImage(file);
                      if (url) {
                        setAdminStatePostFeatureImage(url);
                      }
                    } catch (err) {
                      setStatus(err.message);
                    }
                  }}
                />
              </label>
            </div>
            <div className="rich-field">
              <span>Content (Rich Text)</span>
              <RichTextEditor
                value={adminStatePostContent}
                onChange={setAdminStatePostContent}
                onUploadImage={uploadImage}
              />
            </div>
            <div className="category-grid">
              {adminCategories.map((category) => (
                <label key={category.id} className="category-item">
                  <input
                    type="checkbox"
                    checked={adminStatePostCategoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
              {adminCategories.length === 0 ? (
                <p className="small-text">No categories yet.</p>
              ) : null}
            </div>
            <div className="grid-2">
              <label>
                Status
                <select
                  value={adminStatePostStatus}
                  onChange={(e) => setAdminStatePostStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label>
                Published At
                <input
                  type="text"
                  value={adminStatePostPublishedAt}
                  onChange={(e) => setAdminStatePostPublishedAt(e.target.value)}
                  placeholder="YYYY-MM-DD HH:MM:SS"
                  disabled={adminStatePostStatus !== "published"}
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit">{isEditing ? "Update" : "Add"}</button>
              {isEditing ? (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="table-container card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminStatePosts.map((post) => (
                <tr
                  key={post.id}
                  className={
                    String(post.id) === String(adminStatePostEditId)
                      ? "active-row"
                      : ""
                  }
                >
                  <td>{post.title}</td>
                  <td>{post.type}</td>
                  <td>{(post.categories || []).join(", ") || "-"}</td>
                  <td>{post.status}</td>
                  <td>{post.published_at || "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-sm btn-outline"
                      onClick={() => {
                        setAdminStatePostEditId(String(post.id));
                        setAdminStatePostTitle(post.title || "");
                        setAdminStatePostType(post.type || "");
                        setAdminStatePostStatus(post.status || "draft");
                        setAdminStatePostPublishedAt(post.published_at || "");
                        setAdminStatePostFeatureImage(post.feature_image_url || "");
                        setAdminStatePostContent(post.content || "");
                        setAdminStatePostCategoryIds(post.category_ids || []);
                        if (post.state_name) {
                          setAdminStatePostState(post.state_name);
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteStatePost(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {adminStatePosts.length === 0 ? (
                <tr>
                  <td colSpan="6">No updates yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card preview-panel">
          <h4>Live Preview</h4>
          {adminStatePostFeatureImage ? (
            <div className="preview-image">
              <img src={adminStatePostFeatureImage} alt="Feature" />
            </div>
          ) : null}
          <p className="section-kicker">
            {adminStatePostType || "Category"}
            {adminStatePostPublishedAt ? ` - ${adminStatePostPublishedAt}` : ""}
          </p>
          <h2>{adminStatePostTitle || "Post Title"}</h2>
          <div className="pill-row">
            {adminStatePostCategoryIds.map((id) => {
              const match = adminCategories.find((cat) => cat.id === id);
              return match ? (
                <span key={id} className="pill">
                  {match.name}
                </span>
              ) : null;
            })}
          </div>
          <div
            className="preview-rich"
            dangerouslySetInnerHTML={{ __html: adminStatePostContent || "" }}
          />
        </div>
      </div>
    </div>
  );
}
