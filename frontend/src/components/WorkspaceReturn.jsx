import React from "react";
import { Link } from "react-router-dom";

const WORKSPACES = {
  studio: { destination: "/studio", label: "Return to Studio" },
  concierge: { destination: "/concierge", label: "Return to Concierge" },
};

export default function WorkspaceReturn({ workspace, className = "" }) {
  const target = WORKSPACES[workspace];

  if (!target) return null;

  return (
    <Link
      to={target.destination}
      className={`inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 ${className}`}
    >
      <span aria-hidden="true">←</span>
      {target.label}
    </Link>
  );
}
