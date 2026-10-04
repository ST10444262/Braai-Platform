import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/(dashboard)/profile/page";
import { ToastProvider } from "@/components/ui";
import { makeAuth, makeMe } from "../helpers/testUtils";

jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), del: jest.fn() } }));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const { get, post, put, del } = api as unknown as Record<"get" | "post" | "put" | "del", jest.Mock>;

const DEVICES = [
  { id: "d1", deviceName: "Chrome on Windows", ipAddress: "1.1.1.1", createdAt: "2026-01-10T10:00:00Z", lastUsedAt: "2026-02-01T10:00:00Z", expiresAt: "2026-06-01T10:00:00Z" },
  { id: "d2", deviceName: "Safari on iPhone", ipAddress: "2.2.2.2", createdAt: "2026-01-11T10:00:00Z", lastUsedAt: "2026-02-02T10:00:00Z", expiresAt: "2026-06-01T10:00:00Z" },
];

let auth: ReturnType<typeof makeAuth>;
function setup(over: Record<string, unknown> = {}, meOver: Parameters<typeof makeMe>[0] = {}) {
  auth = makeAuth("Admin", { me: makeMe({ fullName: "Matthew Bowes", email: "matt@inflame.co.za", ...meOver }), ...over });
  (useAuth as jest.Mock).mockReturnValue(auth);
  return render(
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>,
  );
}
const pw = (label: RegExp) => screen.getByLabelText(label);
async function fillPasswords(current = "oldpass", next = "Str0ng!Passw0rd", confirm = next) {
  await userEvent.type(pw(/^Current Password/), current);
  await userEvent.type(pw(/^New Password/), next);
  await userEvent.type(pw(/^Confirm New Password/), confirm);
}

let errSpy: jest.SpyInstance;
beforeEach(() => {
  jest.resetAllMocks();
  get.mockResolvedValue([]);
  post.mockResolvedValue({});
  put.mockResolvedValue({});
  del.mockResolvedValue({});
  reloadMeDefault();
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());
function reloadMeDefault() {
  /* reloadMe is created fresh by makeAuth in setup() */
}

describe("guards", () => {
  it("shows a spinner until auth is ready", () => {
    (useAuth as jest.Mock).mockReturnValue(makeAuth("Admin", { ready: false }));
    const { container } = render(<ProfilePage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });
  it("shows an error when there is no profile", () => {
    (useAuth as jest.Mock).mockReturnValue(makeAuth("Admin", { me: null }));
    render(<ProfilePage />);
    expect(screen.getByText("Could not load your profile.")).toBeInTheDocument();
  });
});

describe("profile card", () => {
  it("shows name, email, upper-cased role and locale details", async () => {
    setup();
    expect(screen.getByRole("heading", { name: "My Profile" })).toBeInTheDocument();
    expect(screen.getByText("Matthew Bowes")).toBeInTheDocument();
    expect(screen.getByText("matt@inflame.co.za")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("South Africa/Cape Town (SAST)")).toBeInTheDocument();
    expect(screen.getByText("English (US)")).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalled());
  });
  it("shows the Super Admin label with spacing", async () => {
    setup({ role: "SuperAdmin" });
    expect(screen.getByText("SUPER ADMIN")).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalled());
  });
  it("stacks to a single column on small screens", async () => {
    const { container } = setup();
    expect(container.querySelector(".grid")!.className).toMatch(/lg:grid-cols-\[340px_1fr\]/);
    await waitFor(() => expect(get).toHaveBeenCalled());
  });
});

describe("change password", () => {
  it.each([
    ["too short", "Sh0rt!"],
    ["no special character", "NoSpecialChars12345"],
  ])("rejects a password that is %s", async (_n, bad) => {
    setup();
    await fillPasswords("old", bad);
    await userEvent.click(screen.getByRole("button", { name: "Update Password" }));
    expect(await screen.findByText("Use at least 12 characters including a special character.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("rejects mismatching confirmation", async () => {
    setup();
    await fillPasswords("old", "Str0ng!Passw0rd", "Different!Passw0rd");
    await userEvent.click(screen.getByRole("button", { name: "Update Password" }));
    expect(await screen.findByText("The new passwords don't match.")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("submits, toasts and clears the form", async () => {
    setup();
    await fillPasswords("oldpass");
    await userEvent.click(screen.getByRole("button", { name: "Update Password" }));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/admin/account/change-password", { currentPassword: "oldpass", newPassword: "Str0ng!Passw0rd" }),
    );
    expect(await screen.findByText("Password updated.")).toBeInTheDocument();
    expect(pw(/^Current Password/)).toHaveValue("");
    expect(pw(/^New Password/)).toHaveValue("");
    expect(pw(/^Confirm New Password/)).toHaveValue("");
  });

  it("shows the API error and keeps what was typed", async () => {
    post.mockRejectedValue(new Error("Current password is wrong"));
    setup();
    await fillPasswords("bad");
    await userEvent.click(screen.getByRole("button", { name: "Update Password" }));
    expect(await screen.findByText("Current password is wrong")).toBeInTheDocument();
    expect(pw(/^Current Password/)).toHaveValue("bad");
  });
});

describe("trusted devices", () => {
  it("loads the devices once the profile is ready", async () => {
    setup();
    await waitFor(() => expect(get).toHaveBeenCalledWith("/admin/account/me/devices"));
  });

  it("lists each device with added and last-used dates", async () => {
    get.mockResolvedValue(DEVICES);
    setup();
    expect(await screen.findByText("Trusted Devices")).toBeInTheDocument();
    expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    expect(screen.getByText("Safari on iPhone")).toBeInTheDocument();
    expect(screen.getAllByText(/Added:.*Last used:/)).toHaveLength(2);
  });

  it("uses a phone icon for mobile devices and a laptop icon otherwise", async () => {
    get.mockResolvedValue(DEVICES);
    setup();
    const desktop = (await screen.findByText("Chrome on Windows")).closest("div.flex")!.parentElement!;
    const phone = screen.getByText("Safari on iPhone").closest("div.flex")!.parentElement!;
    expect(desktop.querySelector(".lucide-laptop")).toBeInTheDocument();
    expect(phone.querySelector(".lucide-smartphone")).toBeInTheDocument();
  });

  it("hides the section when there are no devices", async () => {
    setup();
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(screen.queryByText("Trusted Devices")).toBeNull();
  });

  it("copes with the device request failing", async () => {
    get.mockRejectedValue(new Error("nope"));
    setup();
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: "My Profile" })).toBeInTheDocument();
    expect(screen.queryByText("Trusted Devices")).toBeNull();
  });

  describe("revoking", () => {
    beforeEach(() => get.mockResolvedValue(DEVICES));
    afterEach(() => jest.restoreAllMocks());

    it("asks for confirmation and does nothing if cancelled", async () => {
      const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
      setup();
      await screen.findByText("Chrome on Windows");
      await userEvent.click(screen.getAllByTitle("Revoke device")[0]);
      expect(confirm).toHaveBeenCalled();
      expect(del).not.toHaveBeenCalled();
    });

    it("deletes the device, toasts and reloads the list", async () => {
      jest.spyOn(window, "confirm").mockReturnValue(true);
      setup();
      await screen.findByText("Chrome on Windows");
      await userEvent.click(screen.getAllByTitle("Revoke device")[1]);
      await waitFor(() => expect(del).toHaveBeenCalledWith("/admin/account/me/devices/d2"));
      expect(await screen.findByText("Device revoked.")).toBeInTheDocument();
      await waitFor(() => expect(get.mock.calls.filter(([p]) => p === "/admin/account/me/devices")).toHaveLength(2));
    });

    it("shows the API error if revoking fails", async () => {
      jest.spyOn(window, "confirm").mockReturnValue(true);
      del.mockRejectedValue(new Error("Could not revoke"));
      setup();
      await screen.findByText("Chrome on Windows");
      await userEvent.click(screen.getAllByTitle("Revoke device")[0]);
      expect(await screen.findByText("Could not revoke")).toBeInTheDocument();
    });
  });
});

describe("email notifications", () => {
  it("offers Enable when quote emails are off and turns them on", async () => {
    setup({}, { receiveQuoteEmails: false });
    await userEvent.click(screen.getByRole("button", { name: "Enable" }));
    await waitFor(() => expect(put).toHaveBeenCalledWith("/admin/account/me/preferences", { receiveQuoteEmails: true }));
    expect(await screen.findByText("Quote emails enabled.")).toBeInTheDocument();
    expect(auth.reloadMe).toHaveBeenCalled();
  });

  it("offers Disable when quote emails are on and turns them off", async () => {
    setup({}, { receiveQuoteEmails: true });
    await userEvent.click(screen.getByRole("button", { name: "Disable" }));
    await waitFor(() => expect(put).toHaveBeenCalledWith("/admin/account/me/preferences", { receiveQuoteEmails: false }));
    expect(await screen.findByText("Quote emails disabled.")).toBeInTheDocument();
  });

  it("shows the API error and does not reload when saving fails", async () => {
    put.mockRejectedValue(new Error("Preference not saved"));
    setup({}, { receiveQuoteEmails: false });
    await userEvent.click(screen.getByRole("button", { name: "Enable" }));
    expect(await screen.findByText("Preference not saved")).toBeInTheDocument();
    expect(auth.reloadMe).not.toHaveBeenCalled();
  });
});

describe("two-factor authenticator", () => {
  const open = () => userEvent.click(screen.getByRole("button", { name: "Manage Authenticator" }));
  const footer = (name: string) => within(screen.getByText("Authenticator app").closest("div.relative")!).getByRole("button", { name });

  it("shows whether 2FA is enabled", async () => {
    setup({}, { twoFactorEnabled: true });
    expect(screen.getByText("2FA Enabled")).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalled());
  });
  it("shows when 2FA is not enabled", async () => {
    setup({}, { twoFactorEnabled: false });
    expect(screen.getByText("2FA not enabled")).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalled());
  });

  it("opens a modal offering to start setup", async () => {
    setup({}, { twoFactorEnabled: false });
    await open();
    expect(screen.getByText("Authenticator app")).toBeInTheDocument();
    expect(footer("Start setup")).toBeInTheDocument();
    expect(screen.getByText(/Microsoft Authenticator/)).toBeInTheDocument();
  });

  it("offers a new device and warns that the old key is replaced when already enabled", async () => {
    setup({}, { twoFactorEnabled: true });
    await open();
    expect(footer("Set up a new device")).toBeInTheDocument();
    expect(screen.getByText(/already enabled/)).toBeInTheDocument();
  });

  it("requests setup details from the signed-in endpoint and shows the QR code and key", async () => {
    post.mockResolvedValue({ authenticatorUri: "otpauth://totp/x", sharedKey: "ABCD EFGH", challengeToken: "tok" });
    setup();
    await open();
    await userEvent.click(footer("Start setup"));
    expect(await screen.findByText("ABCD EFGH")).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith("/admin/account/me/2fa/setup");
    expect(document.querySelector("svg[viewBox]")).toBeInTheDocument();
  });

  it("shows an error if setup cannot start", async () => {
    post.mockRejectedValue(new Error("Setup unavailable"));
    setup();
    await open();
    await userEvent.click(footer("Start setup"));
    expect(await screen.findByText("Setup unavailable")).toBeInTheDocument();
  });

  async function reachCodeStep(token: string | null = "tok") {
    post.mockResolvedValueOnce({ authenticatorUri: "otpauth://totp/x", sharedKey: "KEY", challengeToken: token ?? undefined });
    await open();
    await userEvent.click(footer("Start setup"));
    await screen.findByPlaceholderText("123456");
  }

  it("keeps Verify disabled until six digits are entered", async () => {
    setup();
    await reachCodeStep();
    expect(footer("Verify and enable")).toBeDisabled();
    await userEvent.type(screen.getByPlaceholderText("123456"), "12345");
    expect(footer("Verify and enable")).toBeDisabled();
    await userEvent.type(screen.getByPlaceholderText("123456"), "6");
    expect(footer("Verify and enable")).toBeEnabled();
  });

  it("verifies with the code and challenge token, toasts, closes and refreshes the profile", async () => {
    setup();
    await reachCodeStep("challenge-1");
    await userEvent.type(screen.getByPlaceholderText("123456"), "654321");
    await userEvent.click(footer("Verify and enable"));
    await waitFor(() => expect(post).toHaveBeenLastCalledWith("/admin/account/2fa/verify", { code: "654321", challenge: "challenge-1" }));
    expect(await screen.findByText("Two-factor authentication enabled.")).toBeInTheDocument();
    expect(screen.queryByText("Authenticator app")).toBeNull();
    expect(auth.reloadMe).toHaveBeenCalled();
  });

  it("refuses to verify without a challenge token", async () => {
    setup();
    await reachCodeStep(null);
    await userEvent.type(screen.getByPlaceholderText("123456"), "123456");
    await userEvent.click(footer("Verify and enable"));
    expect(await screen.findByText("Missing challenge token.")).toBeInTheDocument();
    expect(post).toHaveBeenCalledTimes(1); // only the setup call
  });

  it("shows the API error for a wrong code and stays open", async () => {
    setup();
    await reachCodeStep();
    post.mockRejectedValueOnce(new Error("Invalid code"));
    await userEvent.type(screen.getByPlaceholderText("123456"), "000000");
    await userEvent.click(footer("Verify and enable"));
    expect(await screen.findByText("Invalid code")).toBeInTheDocument();
    expect(screen.getByText("Authenticator app")).toBeInTheDocument();
  });

  it("cancel closes the modal and discards the setup", async () => {
    setup();
    await reachCodeStep();
    await userEvent.type(screen.getByPlaceholderText("123456"), "123");
    await userEvent.click(footer("Cancel"));
    expect(screen.queryByText("Authenticator app")).toBeNull();
    await open();
    expect(footer("Start setup")).toBeInTheDocument();
  });

  it("the Close button closes the modal before setup starts", async () => {
    setup();
    await open();
    await userEvent.click(screen.getAllByRole("button", { name: "Close" }).pop()!);
    expect(screen.queryByText("Authenticator app")).toBeNull();
  });
});
