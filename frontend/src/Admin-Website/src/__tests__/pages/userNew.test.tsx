import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateUserPage from "@/app/(dashboard)/users/new/page";
import { ToastProvider } from "@/components/ui";
import { makeAuth } from "../helpers/testUtils";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ api: { form: jest.fn() } }));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const form = api.form as jest.Mock;

const renderAs = (role: "Admin" | "SuperAdmin" | "Employee" | null = "Admin", over: Record<string, unknown> = {}) => {
  (useAuth as jest.Mock).mockReturnValue(makeAuth(role, over));
  return render(
    <ToastProvider>
      <CreateUserPage />
    </ToastProvider>,
  );
};
const type = (label: RegExp | string, text: string) => userEvent.type(screen.getByLabelText(label), text);
async function fillValid() {
  await type("First Name *", "  Naledi ");
  await type("Last Name *", " Pillay ");
  await type("Work Email *", " naledi@inflame.co.za ");
  await type(/Temporary Password/, "Temp#Pass12345");
}
// The role chips sit inside the Field's <label>, so the first button's accessible name is the whole label text; select by text.
const employeeChip = () => screen.getByText("Employee", { selector: "button" });
const submit = () => userEvent.click(screen.getByRole("button", { name: /Create User/ }));

beforeEach(() => {
  jest.clearAllMocks();
  form.mockResolvedValue({});
});

describe("access", () => {
  it("blocks employees", () => {
    renderAs("Employee");
    expect(screen.getByText("You don't have access to this page.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Create User/ })).toBeNull();
  });
  it("shows the form to admins and super admins", () => {
    renderAs("Admin");
    expect(screen.getByRole("heading", { name: "Create User" })).toBeInTheDocument();
  });
  it("does not block while auth is loading", () => {
    renderAs(null, { ready: false });
    expect(screen.queryByText(/don't have access/)).toBeNull();
  });
  it("links back to the users list", () => {
    renderAs("Admin");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/users");
  });
});

describe("role choices", () => {
  it("lets admins create employees only", () => {
    renderAs("Admin");
    expect(employeeChip()).toBeInTheDocument();
    expect(screen.queryByText("Admin", { selector: "button" })).toBeNull();
  });
  it("lets super admins create employees or admins", () => {
    renderAs("SuperAdmin");
    expect(employeeChip()).toBeInTheDocument();
    expect(screen.getByText("Admin", { selector: "button" })).toBeInTheDocument();
  });
  it("defaults to Employee", () => {
    renderAs("SuperAdmin");
    expect(employeeChip().className).toMatch(/bg-ink/);
  });
});

describe("temporary password generator", () => {
  it("fills the field with a strong random password", async () => {
    renderAs("Admin");
    await userEvent.click(screen.getByRole("button", { name: "Generate" }));
    const value = (screen.getByLabelText(/Temporary Password/) as HTMLInputElement).value;
    expect(value).toMatch(/^[A-HJ-NP-Za-km-z2-9]{14}aA1!$/);
  });
  it("makes a different password each time", async () => {
    renderAs("Admin");
    const field = screen.getByLabelText(/Temporary Password/) as HTMLInputElement;
    await userEvent.click(screen.getByRole("button", { name: "Generate" }));
    const first = field.value;
    await userEvent.click(screen.getByRole("button", { name: "Generate" }));
    expect(field.value).not.toBe(first);
  });
});

describe("validation", () => {
  it("rejects an empty form", async () => {
    renderAs("Admin");
    await submit();
    expect(await screen.findByText("Fill in every required field.")).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });
  it.each([
    ["first name", "Last Name *", "Work Email *"],
    ["last name", "First Name *", "Work Email *"],
    ["email", "First Name *", "Last Name *"],
  ])("rejects a missing %s", async (_n, a, b) => {
    renderAs("Admin");
    await type(a, "X");
    await type(b, b.startsWith("Work") ? "x@y.co" : "Y");
    await type(/Temporary Password/, "pw12345678");
    await submit();
    expect(await screen.findByText("Fill in every required field.")).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });
  it("rejects a missing password", async () => {
    renderAs("Admin");
    await type("First Name *", "A");
    await type("Last Name *", "B");
    await type("Work Email *", "a@b.co");
    await submit();
    expect(await screen.findByText("Fill in every required field.")).toBeInTheDocument();
  });
  it("treats whitespace-only names as empty", async () => {
    renderAs("Admin");
    await type("First Name *", "   ");
    await type("Last Name *", "B");
    await type("Work Email *", "a@b.co");
    await type(/Temporary Password/, "pw12345678");
    await submit();
    expect(await screen.findByText("Fill in every required field.")).toBeInTheDocument();
  });
});

describe("submitting", () => {
  it("posts the trimmed details as multipart form data", async () => {
    renderAs("Admin");
    await fillValid();
    await submit();
    await waitFor(() => expect(form).toHaveBeenCalledTimes(1));
    const [path, fd] = form.mock.calls[0] as [string, FormData];
    expect(path).toBe("/admin/account/staff");
    expect(fd.get("email")).toBe("naledi@inflame.co.za");
    expect(fd.get("password")).toBe("Temp#Pass12345");
    expect(fd.get("fullName")).toBe("Naledi Pillay");
    expect(fd.get("role")).toBe("Employee");
  });
  it("creates an Admin when a super admin picks that role", async () => {
    renderAs("SuperAdmin");
    await fillValid();
    await userEvent.click(screen.getByText("Admin", { selector: "button" }));
    await submit();
    await waitFor(() => expect(form).toHaveBeenCalled());
    expect((form.mock.calls[0][1] as FormData).get("role")).toBe("Admin");
  });
  it("toasts and returns to the users list on success", async () => {
    renderAs("Admin");
    await fillValid();
    await submit();
    expect(await screen.findByText("Account created. Share the temporary password with Naledi.")).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/users");
  });
  it("shows the API error and stays on the page when creation fails", async () => {
    form.mockRejectedValue(new Error("Email already in use"));
    renderAs("Admin");
    await fillValid();
    await submit();
    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Create User/ })).toBeEnabled();
  });
  it("disables the button while saving", async () => {
    let resolve!: (v: unknown) => void;
    form.mockReturnValue(new Promise((r) => (resolve = r)));
    renderAs("Admin");
    await fillValid();
    await submit();
    expect(screen.getByRole("button", { name: /Create User/ })).toBeDisabled();
    resolve({});
    await waitFor(() => expect(push).toHaveBeenCalled());
  });
});
