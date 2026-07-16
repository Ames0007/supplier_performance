import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState title="Aucun utilisateur" description="Ils apparaîtront ici." />);
    expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument();
    expect(screen.getByText("Ils apparaîtront ici.")).toBeInTheDocument();
  });
});
