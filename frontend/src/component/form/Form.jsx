import React from "react";
import "./form.css";

export function Form({ onSubmit, children }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function Field({ label, required, children, hint, error }) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label className="field__label">
        {label}{required ? <span className="req">*</span> : null}
      </label>
      <div className="field__ctrl">{children}</div>
      {hint && !error && <div className="field__hint">{hint}</div>}
      {error && <div className="field__error">{error}</div>}
    </div>
  );
}

export const Input = (props) => <input className="input" {...props} />;
export const Textarea = (props) => <textarea className="input input--textarea" {...props} />;
export const Select = (props) => <select className="input" {...props} />;

export function NumberInput(props) {
  return <input className="input" type="number" inputMode="decimal" {...props} />;
}

export function DateTimeInput({ value, onChange, ...rest }) {
  return (
    <input
      className="input"
      type="datetime-local"
      value={value || ""} // 前端就維持字串，例如 "2025-10-06T17:30"
      onChange={(e) => onChange?.(e.target.value)} // 傳出同樣格式
      {...rest}
    />
  );
}

export function Actions({ children }) {
  return <div className="form__actions">{children}</div>;
}

export function Button({ children, ...rest }) {
  return <button className="btn btn--primary" {...rest}>{children}</button>;
}

export function GhostButton({ children, ...rest }) {
  return <button className="btn btn--ghost" {...rest}>{children}</button>;
}