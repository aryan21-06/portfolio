"use client";

export default function CopyLinkButton() {
  function copyLink() {
    void navigator.clipboard?.writeText(window.location.href);
  }

  return <button type="button" onClick={copyLink}>copy link <span aria-hidden="true">-&gt;</span></button>;
}
