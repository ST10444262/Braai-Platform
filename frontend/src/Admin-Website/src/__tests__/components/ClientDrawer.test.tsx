import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientDrawer, CreateClientDrawer } from "@/components/ClientDrawer";
import { ToastProvider } from "@/components/ui";
import { makeAuth, makeClient, makeMe, routeGet } from "../helpers/testUtils";

jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({
  api: { get: jest.fn(), put: jest.fn(), post: jest.fn(), del: jest.fn(), form: jest.fn() },
  qs: jest.requireActual("@/lib/api").qs,
}));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const { get, put, post, del, form } = api as unknown as Record<"get" | "put" | "post" | "del" | "form", jest.Mock>;

const NOTE_NEW = { noteId: "n2", content: "Newest note", createdAt: "2026-03-02T10:00:00Z", clientId: "c1abcdef", staffAccountId: "staff-1" };
const NOTE_OLD = { noteId: "n1", content: "Older note", createdAt: "2026-03-01T10:00:00Z", clientId: "c1abcdef", staffAccountId: "other-staff" };
const INV_NEW = { invoiceId: "i2", fileName: "newer.pdf", fileUrl: "https://files/newer.pdf", uploadedAt: "2026-03-05T10:00:00Z", clientId: "c1abcdef", staffAccountId: "staff-1" };
const INV_OLD = { invoiceId: "i1", fileName: "older.pdf", fileUrl: "https://files/older.pdf", uploadedAt: "2026-03-01T10:00:00Z", clientId: "c1abcdef", staffAccountId: "staff-1" };

const onClose = jest.fn();
const onChanged = jest.fn();

function stub(client: Record<string, unknown> | null) {
  routeGet(get, {
    "/admin/crm/clients": client ? [client] : [],
    "/admin/account/staff": [{ staffId: "other-staff", fullName: "Olivia Other", role: "Employee" }],
  });
}
function renderDrawer(role: "Admin" | "Employee" = "Admin", authOver: Record<string, unknown> = {}, clientId: string | null = "c1abcdef") {
  (useAuth as jest.Mock).mockReturnValue(makeAuth(role, { me: makeMe({ staffId: "staff-1", fullName: "Me Myself", role }), ...authOver }));
  return render(
    <ToastProvider>
      <ClientDrawer clientId={clientId} onClose={onClose} onChanged={onChanged} />
    </ToastProvider>,
  );
}
async function loaded(role: "Admin" | "Employee" = "Admin", authOver: Record<string, unknown> = {}) {
  const view = renderDrawer(role, authOver);
  await screen.findByText(/Client Profile: Sipho Dlamini/);
  return view;
}
const footerSave = () => {
  const all = screen.getAllByRole("button", { name: "Save Changes" });
  return all[all.length - 1];
};
const inlineSave = () => screen.getAllByRole("button", { name: "Save Changes" })[0];

beforeEach(() => {
  jest.resetAllMocks();
  stub(makeClient({ internalNotes: [NOTE_OLD, NOTE_NEW], invoiceRecords: [INV_OLD, INV_NEW] }));
  put.mockResolvedValue({});
  post.mockResolvedValue({});
  del.mockResolvedValue({});
  form.mockResolvedValue({});
});

describe("loading", () => {
  it("does not fetch a client when no id is given", () => {
    renderDrawer("Admin", {}, null);
    expect(get.mock.calls.some(([p]) => p.includes("clientId="))).toBe(false);
    expect(screen.getByText("Client Profile")).toBeInTheDocument();
  });
  it("shows Loading… then the client", async () => {
    renderDrawer();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(await screen.findByText(/Client Profile: Sipho Dlamini/)).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/admin/crm/clients?clientId=c1abcdef");
  });
  it("shows the id and customer-since month in the subtitle", async () => {
    await loaded();
    expect(screen.getByText(/ID: #CLI-C1ABC • Customer since Jun\.?\s+2025/)).toBeInTheDocument();
  });
  it("shows the details read-only", async () => {
    await loaded();
    expect(screen.getByText("sipho@example.com")).toBeInTheDocument();
    expect(screen.getByText("0831112222")).toBeInTheDocument();
    expect(screen.getByText("1 Main Rd")).toBeInTheDocument();
  });
  it("shows a dash for empty fields", async () => {
    stub(makeClient({ physicalAddress: "" }));
    await loaded();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("editing details", () => {
  it("starts read-only with Save disabled in the footer", async () => {
    await loaded();
    expect(footerSave()).toBeDisabled();
    expect(screen.queryByDisplayValue("Sipho Dlamini")).toBeNull();
  });
  it("switches to editable inputs prefilled with the current values", async () => {
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: /Edit Details/ }));
    expect(screen.getByDisplayValue("Sipho Dlamini")).toBeInTheDocument();
    expect(screen.getByDisplayValue("sipho@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0831112222")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1 Main Rd")).toBeInTheDocument();
    expect(footerSave()).toBeEnabled();
  });
  it("cancels back to read-only", async () => {
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: /Edit Details/ }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByDisplayValue("Sipho Dlamini")).toBeNull();
    expect(screen.getByRole("button", { name: /Edit Details/ })).toBeInTheDocument();
  });
  it("saves the edited details, toasts and notifies the page", async () => {
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: /Edit Details/ }));
    const name = screen.getByDisplayValue("Sipho Dlamini");
    await userEvent.clear(name);
    await userEvent.type(name, "Sipho Zulu");
    await userEvent.click(inlineSave());
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith("/admin/crm/clients/c1abcdef", {
        clientId: "c1abcdef", fullName: "Sipho Zulu", email: "sipho@example.com", phone: "0831112222", physicalAddress: "1 Main Rd",
      }),
    );
    expect(await screen.findByText("Client updated.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
  });
  it("saves from the footer button too", async () => {
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: /Edit Details/ }));
    await userEvent.click(footerSave());
    await waitFor(() => expect(put).toHaveBeenCalled());
  });
  it.each([["Full Name", "Sipho Dlamini"], ["Email Address", "sipho@example.com"], ["Phone Number", "0831112222"]])(
    "requires %s",
    async (label, current) => {
      await loaded();
      await userEvent.click(screen.getByRole("button", { name: /Edit Details/ }));
      expect(screen.getByLabelText(label)).toBeInTheDocument();
      await userEvent.clear(screen.getByDisplayValue(current));
      await userEvent.click(inlineSave());
      expect(await screen.findByText("Name, email and phone are required.")).toBeInTheDocument();
      expect(put).not.toHaveBeenCalled();
    },
  );
  it("shows the API error when saving fails", async () => {
    put.mockRejectedValue(new Error("Email already used"));
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: /Edit Details/ }));
    await userEvent.click(inlineSave());
    expect(await screen.findByText("Email already used")).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });
});

describe("internal notes", () => {
  const noteBox = () => screen.getByPlaceholderText("Add a note about this client...");
  const addBtn = () => screen.getByRole("button", { name: /Add Comment/ });

  it("lists notes newest first", async () => {
    await loaded();
    const items = screen.getAllByText(/note$/);
    expect(items.map((e) => e.textContent)).toEqual(["Newest note", "Older note"]);
  });
  it("shows an empty state", async () => {
    stub(makeClient({ internalNotes: [] }));
    await loaded();
    expect(screen.getByText("No notes yet.")).toBeInTheDocument();
  });
  it("shows the author's role from the staff directory, or this user's own role, or a fallback", async () => {
    stub(makeClient({ internalNotes: [NOTE_NEW, NOTE_OLD, { ...NOTE_OLD, noteId: "n3", content: "Ghost note", staffAccountId: "ghost", createdAt: "2026-02-01T10:00:00Z" }] }));
    await loaded("Admin");
    await waitFor(() => expect(screen.getByText("Employee")).toBeInTheDocument()); // other-staff from directory
    expect(screen.getByText("Admin")).toBeInTheDocument(); // me
    expect(screen.getByText("Staff")).toBeInTheDocument(); // unknown
  });
  it("adds a note as the signed-in staff member", async () => {
    await loaded();
    await userEvent.type(noteBox(), "  Called the client  ");
    await userEvent.click(addBtn());
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/admin/crm/clients/c1abcdef/notes", { content: "Called the client", staffAccountId: "staff-1" }),
    );
    expect(await screen.findByText("Note added.")).toBeInTheDocument();
    expect(noteBox()).toHaveValue("");
  });
  it("won't add an empty note", async () => {
    await loaded();
    await userEvent.type(noteBox(), "   ");
    await userEvent.click(addBtn());
    expect(await screen.findByText("Write a note first.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });
  it("explains when the staff profile could not be loaded", async () => {
    await loaded("Admin", { me: makeMe({ staffId: null }) });
    await userEvent.type(noteBox(), "hello");
    await userEvent.click(addBtn());
    expect(await screen.findByText(/staff profile could not be loaded/)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });
  it("shows the API error and keeps the text when adding fails", async () => {
    post.mockRejectedValue(new Error("Note rejected"));
    await loaded();
    await userEvent.type(noteBox(), "keep me");
    await userEvent.click(addBtn());
    expect(await screen.findByText("Note rejected")).toBeInTheDocument();
    expect(noteBox()).toHaveValue("keep me");
  });
  it("lets admins delete any note", async () => {
    await loaded("Admin");
    expect(screen.getAllByLabelText("Delete note")).toHaveLength(2);
    await userEvent.click(screen.getAllByLabelText("Delete note")[1]);
    await waitFor(() => expect(del).toHaveBeenCalledWith("/admin/crm/clients/c1abcdef/notes/n1"));
  });
  it("lets employees delete only their own notes", async () => {
    await loaded("Employee");
    const buttons = screen.getAllByLabelText("Delete note");
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]);
    await waitFor(() => expect(del).toHaveBeenCalledWith("/admin/crm/clients/c1abcdef/notes/n2"));
  });
  it("shows the API error when deleting a note fails", async () => {
    del.mockRejectedValue(new Error("Cannot delete"));
    await loaded("Admin");
    await userEvent.click(screen.getAllByLabelText("Delete note")[0]);
    expect(await screen.findByText("Cannot delete")).toBeInTheDocument();
  });
});

describe("invoices", () => {
  const fileInput = () => document.querySelector("input[type=file]") as HTMLInputElement;
  const pdf = (name = "invoice.pdf") => new File(["%PDF"], name, { type: "application/pdf" });

  it("lists invoices newest first with download links", async () => {
    await loaded();
    const names = screen.getAllByText(/\.pdf$/).map((e) => e.textContent);
    expect(names).toEqual(["newer.pdf", "older.pdf"]);
    const links = screen.getAllByLabelText("Download");
    expect(links[0]).toHaveAttribute("href", "https://files/newer.pdf");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });
  it("uploads selected files with the staff id", async () => {
    await loaded();
    await userEvent.upload(fileInput(), [pdf("a.pdf"), pdf("b.pdf")]);
    await waitFor(() => expect(form).toHaveBeenCalledTimes(1));
    const [path, fd] = form.mock.calls[0] as [string, FormData];
    expect(path).toBe("/admin/crm/clients/c1abcdef/invoices");
    expect((fd.getAll("Files") as File[]).map((f) => f.name)).toEqual(["a.pdf", "b.pdf"]);
    expect(fd.get("StaffAccountId")).toBe("staff-1");
    expect(await screen.findByText("Invoice uploaded.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
  });
  it("skips files over 10 MB with a warning", async () => {
    await loaded();
    const big = pdf("huge.pdf");
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    await userEvent.upload(fileInput(), big);
    expect(await screen.findByText("Files over 10 MB were skipped.")).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });
  it("uploads the small files and skips only the big ones", async () => {
    await loaded();
    const big = pdf("huge.pdf");
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    await userEvent.upload(fileInput(), [pdf("ok.pdf"), big]);
    expect(await screen.findByText("Files over 10 MB were skipped.")).toBeInTheDocument();
    await waitFor(() => expect(form).toHaveBeenCalled());
    expect((form.mock.calls[0][1] as FormData).getAll("Files")).toHaveLength(1);
  });
  it("explains when the staff profile is missing", async () => {
    await loaded("Admin", { me: makeMe({ staffId: null }) });
    await userEvent.upload(fileInput(), pdf());
    expect(await screen.findByText(/staff profile could not be loaded/)).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });
  it("shows the API error when uploading fails", async () => {
    form.mockRejectedValue(new Error("Upload failed"));
    await loaded();
    await userEvent.upload(fileInput(), pdf());
    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
  });
  it("deletes an invoice", async () => {
    await loaded();
    await userEvent.click(screen.getAllByLabelText("Delete invoice")[1]);
    await waitFor(() => expect(del).toHaveBeenCalledWith("/admin/crm/clients/c1abcdef/invoices/i1"));
    expect(await screen.findByText("Invoice deleted.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
  });
});

describe("deleting the client", () => {
  it("is only offered to admins", async () => {
    await loaded("Employee");
    expect(screen.queryByRole("button", { name: /Delete Client/ })).toBeNull();
  });
  it("asks for confirmation first", async () => {
    await loaded("Admin");
    await userEvent.click(screen.getByRole("button", { name: /Delete Client/ }));
    expect(screen.getByText("Delete this client?")).toBeInTheDocument();
    expect(del).not.toHaveBeenCalled();
  });
  it("can be cancelled", async () => {
    await loaded("Admin");
    await userEvent.click(screen.getByRole("button", { name: /Delete Client/ }));
    await userEvent.click(screen.getAllByRole("button", { name: "Cancel" }).pop()!);
    expect(screen.queryByText("Delete this client?")).toBeNull();
    expect(del).not.toHaveBeenCalled();
  });
  it("deletes, toasts, notifies and closes the drawer", async () => {
    await loaded("Admin");
    await userEvent.click(screen.getByRole("button", { name: /Delete Client/ }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(del).toHaveBeenCalledWith("/admin/crm/clients/c1abcdef"));
    expect(await screen.findByText("Client deleted.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
  it("shows the API error and keeps the drawer open on failure", async () => {
    del.mockRejectedValue(new Error("Client has open quotes"));
    await loaded("Admin");
    await userEvent.click(screen.getByRole("button", { name: /Delete Client/ }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Client has open quotes")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("closing", () => {
  it("closes from the footer button", async () => {
    await loaded();
    await userEvent.click(screen.getByText("Close", { selector: "button" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("closes from the header X", async () => {
    await loaded();
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("CreateClientDrawer", () => {
  const onCreated = jest.fn();
  const onCloseCreate = jest.fn();
  const renderCreate = (open = true) =>
    render(
      <ToastProvider>
        <CreateClientDrawer open={open} onClose={onCloseCreate} onCreated={onCreated} />
      </ToastProvider>,
    );
  const save = () => userEvent.click(screen.getByRole("button", { name: "Save New Client" }));

  beforeEach(() => {
    onCreated.mockClear();
    onCloseCreate.mockClear();
  });

  it("shows the empty form", () => {
    renderCreate();
    expect(screen.getByText("Create New Client")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter full name")).toHaveValue("");
  });
  it.each([
    ["name", "Enter full name"],
    ["email", "client@example.com"],
    ["phone", "+27 12 213 3249"],
  ])("requires the %s", async (_n, skipPlaceholder) => {
    renderCreate();
    const fill: [string, string][] = [["Enter full name", "Jo Soap"], ["client@example.com", "jo@x.co"], ["+27 12 213 3249", "0820000000"]];
    for (const [ph, v] of fill) if (ph !== skipPlaceholder) await userEvent.type(screen.getByPlaceholderText(ph), v);
    await save();
    expect(await screen.findByText("Name, email and phone are required.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });
  it("creates the client, toasts, notifies and closes", async () => {
    renderCreate();
    await userEvent.type(screen.getByPlaceholderText("Enter full name"), "Jo Soap");
    await userEvent.type(screen.getByPlaceholderText("client@example.com"), "jo@x.co");
    await userEvent.type(screen.getByPlaceholderText("+27 12 213 3249"), "0820000000");
    await userEvent.type(screen.getByPlaceholderText("Enter full address"), "5 Long St");
    await save();
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/admin/crm/clients", { fullName: "Jo Soap", email: "jo@x.co", phone: "0820000000", physicalAddress: "5 Long St" }),
    );
    expect(await screen.findByText("Client created.")).toBeInTheDocument();
    expect(onCreated).toHaveBeenCalled();
    expect(onCloseCreate).toHaveBeenCalled();
  });
  it("shows the API error and stays open on failure", async () => {
    post.mockRejectedValue(new Error("Duplicate client"));
    renderCreate();
    await userEvent.type(screen.getByPlaceholderText("Enter full name"), "Jo");
    await userEvent.type(screen.getByPlaceholderText("client@example.com"), "jo@x.co");
    await userEvent.type(screen.getByPlaceholderText("+27 12 213 3249"), "082");
    await save();
    expect(await screen.findByText("Duplicate client")).toBeInTheDocument();
    expect(onCloseCreate).not.toHaveBeenCalled();
  });
  it("clears the form each time it is reopened", async () => {
    const { rerender } = renderCreate();
    await userEvent.type(screen.getByPlaceholderText("Enter full name"), "Left over");
    rerender(<ToastProvider><CreateClientDrawer open={false} onClose={onCloseCreate} onCreated={onCreated} /></ToastProvider>);
    rerender(<ToastProvider><CreateClientDrawer open onClose={onCloseCreate} onCreated={onCreated} /></ToastProvider>);
    expect(screen.getByPlaceholderText("Enter full name")).toHaveValue("");
  });
  it("cancels", async () => {
    renderCreate();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCloseCreate).toHaveBeenCalled();
  });
});
