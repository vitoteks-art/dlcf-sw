import React, { useId } from "react";

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Start typing to search...",
  disabled = false,
  required = false,
  name,
  className = "",
  hint = "",
}) {
  const generatedId = useId();
  const listId = `${name || "searchable-select"}-${generatedId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const normalizedOptions = Array.from(new Set((options || []).filter(Boolean).map((item) => String(item))));

  return (
    <label className={`searchable-select-field ${className}`.trim()}>
      {label}
      <input
        list={listId}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
      <datalist id={listId}>
        {normalizedOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
