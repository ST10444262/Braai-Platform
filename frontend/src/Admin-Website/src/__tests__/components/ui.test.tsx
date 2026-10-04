import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Avatar, Button, Card, Chips, ConfirmDialog, Drawer, Dropzone, ErrorNote, Field, Modal, PageHeader,
  Pagination, Pill, Spinner, StatusBadge, TextInput, ToastProvider, cn, useToast,
} from "@/components/ui";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("Button", () => {
  it("renders children and fires onClick", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("is disabled while loading and does not fire", async () => {
    const onClick = jest.fn();
    render(<Button loading onClick={onClick}>Save</Button>);
    const b = screen.getByRole("button");
    expect(b).toBeDisabled();
    await userEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });
  it("respects the disabled prop", () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
  it("applies variant and size classes", () => {
    render(<Button variant="danger" size="sm">X</Button>);
    expect(screen.getByRole("button").className).toMatch(/text-red-600/);
    expect(screen.getByRole("button").className).toMatch(/h-9/);
  });
});

describe("StatusBadge", () => {
  it.each([["New", "New"], ["UnderReview", "Under Review"], ["Contacted", "Contacted"], ["Converted", "Converted"], ["Dead", "Dead"]])("shows %s as '%s'", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it("shows 'Under Review' (with a space, as the API sends it) as Under Review, not New", () => {
    render(<StatusBadge status="Under Review" />);
    expect(screen.getByText("Under Review")).toBeInTheDocument();
    expect(screen.queryByText("New")).toBeNull();
  });
  it("falls back to New for unknown statuses", () => {
    render(<StatusBadge status="Mystery" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });
});

describe("Pill, Avatar, Card, ErrorNote, Spinner", () => {
  it("Pill renders its content with the chosen tone", () => {
    render(<Pill tone="red">Hot</Pill>);
    expect(screen.getByText("Hot").className).toMatch(/text-red-600/);
  });
  it("Avatar shows up to two initials", () => {
    render(<Avatar name="Naledi Anne Pillay" />);
    expect(screen.getByText("NA")).toBeInTheDocument();
  });
  it("Avatar shows ? for empty names", () => {
    render(<Avatar name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
  it("Card renders children", () => {
    render(<Card>inside</Card>);
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
  it("ErrorNote renders the message", () => {
    render(<ErrorNote message="Broke" />);
    expect(screen.getByText("Broke")).toBeInTheDocument();
  });
  it("Spinner renders", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders title, optional subtitle and action", () => {
    render(<PageHeader title="Leads" subtitle="All of them" action={<button>Go</button>} />);
    expect(screen.getByRole("heading", { name: "Leads" })).toBeInTheDocument();
    expect(screen.getByText("All of them")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });
  it("omits the subtitle when not provided", () => {
    const { container } = render(<PageHeader title="Leads" />);
    expect(container.querySelector("p")).toBeNull();
  });
});

describe("Field and TextInput", () => {
  it("associates the label text and shows a hint", () => {
    render(<Field label="Email" hint="Work address"><TextInput /></Field>);
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByText("Work address")).toBeInTheDocument();
  });
  it("TextInput forwards props and merges className", () => {
    render(<TextInput placeholder="p" className="extra" />);
    const i = screen.getByPlaceholderText("p");
    expect(i.className).toMatch(/extra/);
  });
});

describe("Chips", () => {
  it("calls onChange with the clicked option", async () => {
    const onChange = jest.fn();
    render(<Chips options={["A", "B"]} value="A" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("B");
  });
  it("highlights the selected value", () => {
    render(<Chips options={["A", "B"]} value="A" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "A" }).className).toMatch(/bg-ink/);
    expect(screen.getByRole("button", { name: "B" }).className).not.toMatch(/bg-ink text-white/);
  });
  it("disables every chip when disabled", () => {
    render(<Chips options={["A", "B"]} value="A" onChange={() => {}} disabled />);
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });
});

describe("Pagination", () => {
  const setup = (over: Partial<React.ComponentProps<typeof Pagination>> = {}) => {
    const onChange = jest.fn();
    render(<Pagination page={1} pageSize={10} total={35} noun="leads" onChange={onChange} {...over} />);
    return onChange;
  };
  it("shows the visible range", () => {
    setup({ page: 2 });
    expect(screen.getByText("Showing 11-20 of 35 leads")).toBeInTheDocument();
  });
  it("clamps the last page range to the total", () => {
    setup({ page: 4 });
    expect(screen.getByText("Showing 31-35 of 35 leads")).toBeInTheDocument();
  });
  it("shows 0-0 when empty", () => {
    setup({ total: 0 });
    expect(screen.getByText("Showing 0-0 of 0 leads")).toBeInTheDocument();
  });
  it("disables previous on the first page and next on the last", () => {
    setup({ page: 1 });
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeEnabled();
  });
  it("disables next on the last page", () => {
    setup({ page: 4 });
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });
  it("navigates with prev/next and numbered buttons", async () => {
    const onChange = setup({ page: 2 });
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByLabelText("Previous page"));
    expect(onChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
  });
  it("shows a sliding window of three page numbers", () => {
    setup({ page: 4 });
    ["2", "3", "4"].forEach((n) => expect(screen.getByRole("button", { name: n })).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "1" })).toBeNull();
  });
  it("renders only one page button when there is a single page", () => {
    setup({ total: 5 });
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });
});

describe("Drawer", () => {
  it("renders title, subtitle, body, headerRight and footer", () => {
    render(<Drawer open onClose={() => {}} title="T" subtitle="S" headerRight={<i>HR</i>} footer={<b>F</b>}>body</Drawer>);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getByText("F")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
  it("calls onClose from the close button and the backdrop", async () => {
    const onClose = jest.fn();
    const { container } = render(<Drawer open onClose={onClose} title="T">x</Drawer>);
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(container.querySelector(".backdrop-blur-\\[2px\\]") as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it("is pointer-inert when closed", () => {
    const { container } = render(<Drawer open={false} onClose={() => {}} title="T">x</Drawer>);
    expect((container.firstChild as HTMLElement).className).toMatch(/pointer-events-none/);
  });
});

describe("Modal and ConfirmDialog", () => {
  it("Modal renders nothing when closed", () => {
    const { container } = render(<Modal open={false} onClose={() => {}} title="M">x</Modal>);
    expect(container).toBeEmptyDOMElement();
  });
  it("Modal renders content, footer and closes", async () => {
    const onClose = jest.fn();
    render(<Modal open onClose={onClose} title="M" footer={<span>foot</span>}>content</Modal>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.getByText("foot")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
  it("ConfirmDialog confirms and cancels", async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(<ConfirmDialog open title="Sure?" message="Really?" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText("Really?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
  it("ConfirmDialog supports a custom label and loading state", () => {
    render(<ConfirmDialog open title="t" message="m" confirmLabel="Remove" loading onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });
});

describe("Dropzone", () => {
  const file = (name: string) => new File(["x"], name);
  it("passes selected files to onFiles and resets the input", async () => {
    const onFiles = jest.fn();
    const { container } = render(<Dropzone onFiles={onFiles} title="Upload" hint="hint" />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    await userEvent.upload(input, [file("a.pdf"), file("b.pdf")]);
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.pdf" }), expect.objectContaining({ name: "b.pdf" })]);
  });
  it("handles dropped files", () => {
    const onFiles = jest.fn();
    render(<Dropzone onFiles={onFiles} title="Upload" hint="hint" />);
    const zone = screen.getByText("Upload").closest("div[class*='border-dashed']") as HTMLElement;
    fireEvent.dragOver(zone);
    expect(zone.className).toMatch(/border-ink/);
    fireEvent.dragLeave(zone);
    expect(zone.className).not.toMatch(/border-ink bg-card/);
    fireEvent.drop(zone, { dataTransfer: { files: [file("dropped.png")] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "dropped.png" })]);
  });
  it("ignores drops with no files", () => {
    const onFiles = jest.fn();
    render(<Dropzone onFiles={onFiles} title="Upload" hint="hint" />);
    fireEvent.drop(screen.getByText("Upload").closest("div[class*='border-dashed']") as HTMLElement, { dataTransfer: { files: [] } });
    expect(onFiles).not.toHaveBeenCalled();
  });
  it("forwards accept and multiple to the input", () => {
    const { container } = render(<Dropzone onFiles={() => {}} title="U" hint="h" accept=".pdf" multiple={false} />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    expect(input).toHaveAttribute("accept", ".pdf");
    expect(input.multiple).toBe(false);
  });
});

describe("Toasts", () => {
  function Trigger() {
    const toast = useToast();
    return (
      <>
        <button onClick={() => toast("Saved")}>ok</button>
        <button onClick={() => toast("Failed", "err")}>err</button>
      </>
    );
  }
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("shows a success toast then removes it after 4.5s", () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText("ok"));
    expect(screen.getByText("Saved").className).toMatch(/bg-ink/);
    act(() => { jest.advanceTimersByTime(4500); });
    expect(screen.queryByText("Saved")).toBeNull();
  });
  it("styles error toasts in red", () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText("err"));
    expect(screen.getByText("Failed").className).toMatch(/bg-red-600/);
  });
  it("stacks multiple toasts", () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByText("ok"));
    fireEvent.click(screen.getByText("err"));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
  it("useToast is a harmless no-op without a provider", () => {
    render(<Trigger />);
    expect(() => fireEvent.click(screen.getByText("ok"))).not.toThrow();
  });
});
