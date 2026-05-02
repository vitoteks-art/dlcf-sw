import { useEffect, useRef, useState } from "react";

const blockFormats = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
];

export default function RichTextEditor({ value, onChange, onUploadImage, onOpenMediaLibrary }) {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const focusEditor = () => editorRef.current?.focus();

  const exec = (command, arg = null) => {
    focusEditor();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const wrapHtml = (html) => {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    emitChange();
  };

  const insertImage = (url, meta = {}) => {
    if (!url) return;
    const alt = (meta.alt || meta.title || "Publication image").replace(/"/g, "&quot;");
    const caption = meta.caption ? `<figcaption>${meta.caption}</figcaption>` : "";
    wrapHtml(`<figure class="editor-image-block"><img src="${url}" alt="${alt}" />${caption}</figure><p><br></p>`);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUploadImage) return;
    if (!file.type?.startsWith("image/")) {
      window.alert("Only image files can be inserted into the publication body.");
      return;
    }
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      insertImage(url, { title: file.name });
    } catch (err) {
      window.alert(err?.message || "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) exec("createLink", url);
  };

  const handleMediaLibrary = () => {
    if (onOpenMediaLibrary) {
      onOpenMediaLibrary((asset) => insertImage(asset.url, asset));
      return;
    }
    fileRef.current?.click();
  };

  return (
    <div className="rich-editor wp-editor">
      <div className="rich-toolbar wp-toolbar">
        <select aria-label="Text style" onChange={(e) => exec("formatBlock", e.target.value)} defaultValue="p">
          {blockFormats.map((format) => <option key={format.value} value={format.value}>{format.label}</option>)}
        </select>
        <button type="button" onClick={() => exec("bold")} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => exec("italic")} title="Italic"><em>I</em></button>
        <button type="button" onClick={() => exec("underline")} title="Underline"><u>U</u></button>
        <button type="button" onClick={() => exec("insertUnorderedList")}>Bullets</button>
        <button type="button" onClick={() => exec("insertOrderedList")}>Numbered</button>
        <button type="button" onClick={() => exec("justifyLeft")}>Left</button>
        <button type="button" onClick={() => exec("justifyCenter")}>Center</button>
        <button type="button" onClick={() => exec("justifyRight")}>Right</button>
        <button type="button" onClick={handleLink}>Link</button>
        <button type="button" onClick={handleMediaLibrary}>Add Media</button>
        <label className="rich-upload">
          Upload Image
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
        <button type="button" onClick={() => exec("removeFormat")}>Clear</button>
      </div>
      {uploading ? <div className="upload-inline-status">Uploading image…</div> : null}
      <div
        ref={editorRef}
        className="rich-content wp-content-editor"
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
        data-placeholder="Start writing your publication here. Use Add Media to insert images like WordPress…"
      />
    </div>
  );
}
