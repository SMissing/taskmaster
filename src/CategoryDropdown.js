import React, { useState, useRef, useEffect } from 'react';

export default function CategoryDropdown({ categories, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="custom-dropdown" ref={ref}>
      <button
        className="dropdown-toggle"
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected || 'Select category'}
        <span className="dropdown-arrow">▼</span>
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox">
          {categories.map(cat => (
            <li
              key={cat}
              className={cat === selected ? 'selected' : ''}
              role="option"
              aria-selected={cat === selected}
              onClick={() => { onSelect(cat); setOpen(false); }}
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
