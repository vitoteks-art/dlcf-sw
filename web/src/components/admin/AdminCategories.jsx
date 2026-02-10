export default function AdminCategories({
  adminCategories,
  adminCategoryName,
  setAdminCategoryName,
  adminCategoryEditId,
  setAdminCategoryEditId,
  adminCategoryEditName,
  setAdminCategoryEditName,
  handleAddCategory,
  handleEditCategory,
  handleDeleteCategory,
}) {
  const isEditing = !!adminCategoryEditId;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Global Categories</h3>
      </div>

      <div className="panel-content">
        <div className="form-card card">
          <h4>{isEditing ? "Edit Category" : "Add New Category"}</h4>
          <form
            onSubmit={isEditing ? handleEditCategory : handleAddCategory}
            className="form compact-form"
          >
            <label>
              Category Name
              <input
                type="text"
                value={isEditing ? adminCategoryEditName : adminCategoryName}
                onChange={(e) =>
                  isEditing
                    ? setAdminCategoryEditName(e.target.value)
                    : setAdminCategoryName(e.target.value)
                }
                required
              />
            </label>
            <div className="form-actions">
              <button type="submit">{isEditing ? "Update" : "Add"}</button>
              {isEditing ? (
                <button type="button" onClick={() => setAdminCategoryEditId("")}>
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
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminCategories.map((category) => (
                <tr
                  key={category.id}
                  className={
                    String(category.id) === String(adminCategoryEditId)
                      ? "active-row"
                      : ""
                  }
                >
                  <td>{category.name}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-sm btn-outline"
                      onClick={() => {
                        setAdminCategoryEditId(String(category.id));
                        setAdminCategoryEditName(category.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {adminCategories.length === 0 ? (
                <tr>
                  <td colSpan="2">No categories yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
