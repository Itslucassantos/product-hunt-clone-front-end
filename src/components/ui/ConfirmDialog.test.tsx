import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { ConfirmDialog } from "./ConfirmDialog";

function setup(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  renderWithProviders(
    <ConfirmDialog
      open
      title="Delete product?"
      description="This cannot be undone."
      cancelLabel="Cancel"
      confirmLabel="Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onCancel, onConfirm };
}

describe("ConfirmDialog", () => {
  it("opens as a labelled alert dialog", () => {
    setup();
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleName("Delete product?");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("calls onConfirm and onCancel from the buttons", async () => {
    const { onCancel, onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("cancels on Esc and when clicking outside", () => {
    const { onCancel } = setup();
    const dialog = screen.getByRole("alertdialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("does not close while loading", () => {
    const { onCancel } = setup({ loading: true });
    const dialog = screen.getByRole("alertdialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("hides the confirm button in the blocked variant", () => {
    setup({ variant: "blocked" });
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });
});
