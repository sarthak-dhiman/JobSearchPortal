import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

export default function Dropdown({ label, items = [], onSelect }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handlePick = (val) => {
    setOpen(false);
    onSelect?.(val);
  };

  return (
    <div className="dd">
      <button
        ref={btnRef}
        className={"pill-btn dd__btn"}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <span className={"caret" + (open ? " caret--up" : "")} aria-hidden />
      </button>

      {open && (
        <div ref={menuRef} className="menu dd__menu" role="menu">
          {items.map((it) => (
            <button
              key={it.value}
              className="menu__item"
              role="menuitem"
              onClick={() => handlePick(it.value)}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
