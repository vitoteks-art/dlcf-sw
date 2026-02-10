import { useEffect, useRef } from "react";

export default function RichTextEditor({ value, onChange, onUploadImage }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const exec = (command, arg = null) => {
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUploadImage) return;
    try {
      const url = await onUploadImage(file);
      if (url) {
        exec("insertImage", url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) {
      exec("createLink", url);
    }
  };

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        <button type="button" onClick={() => exec("bold")}>
          Bold
        </button>
        <button type="button" onClick={() => exec("italic")}>
          Italic
        </button>
        <button type="button" onClick={() => exec("insertUnorderedList")}>
          Bullet
        </button>
        <button type="button" onClick={() => exec("insertOrderedList")}>
          Number
        </button>
        <button type="button" onClick={handleLink}>
          Link
        </button>
        <label className="rich-upload">
          Image
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>
      <div
        ref={editorRef}
        className="rich-content"
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
      />
    </div>
  );
}
