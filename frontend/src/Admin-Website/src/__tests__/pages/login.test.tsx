import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { makeAuth } from "../helpers/testUtils";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
import { useAuth } from "@/lib/auth";
const mockAuth = useAuth as jest.Mock;

let auth: ReturnType<typeof makeAuth>;
beforeEach(() => {
  jest.clearAllMocks();
  auth = makeAuth(null);
  mockAuth.mockImplementation(() => auth);
});

async function fillCredentials(email = "  boss@inflame.co.za ", password = "secret") {
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/password/i), password);
}
const submit = () => userEvent.click(screen.getByRole("button", { name: /sign in/i }));

describe("LoginPage – initial state", () => {
  it("shows the sign-in form", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to the staff dashboard.")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
  });

  it("redirects already signed-in staff to the overview", () => {
    auth = makeAuth("Admin");
    render(<LoginPage />);
    expect(replace).toHaveBeenCalledWith("/overview");
  });

  it("does not redirect while auth is still loading", () => {
    auth = makeAuth("Admin", { ready: false });
    render(<LoginPage />);
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect when signed out", () => {
    render(<LoginPage />);
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("LoginPage – password login", () => {
  it("trims the email and goes to the overview on success", async () => {
    auth.login.mockResolvedValue({ requiresTwoFactor: false });
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/overview"));
    expect(auth.login).toHaveBeenCalledWith("boss@inflame.co.za", "secret");
  });

  it("shows the error message when login fails and does not navigate", async () => {
    auth.login.mockRejectedValue(new Error("Invalid credentials"));
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("disables the button while the request is in flight", async () => {
    let resolve!: (v: unknown) => void;
    auth.login.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    resolve({ requiresTwoFactor: false });
    await waitFor(() => expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled());
  });

  it("clears an earlier error on the next attempt", async () => {
    auth.login.mockRejectedValueOnce(new Error("Nope")).mockResolvedValueOnce({ requiresTwoFactor: false });
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    expect(await screen.findByText("Nope")).toBeInTheDocument();
    await submit();
    await waitFor(() => expect(screen.queryByText("Nope")).toBeNull());
  });
});

describe("LoginPage – two-factor challenge", () => {
  beforeEach(() => {
    auth.login.mockResolvedValue({ requiresTwoFactor: true, userId: "u1", twoFactorChallenge: "ch1" });
  });

  async function reachChallenge() {
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    await screen.findByRole("heading", { name: "Two-factor check" });
  }

  it("switches to the code entry step", async () => {
    await reachChallenge();
    expect(screen.getByLabelText(/authenticator code/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
    expect(screen.getByRole("button", { name: /verify and sign in/i })).toBeInTheDocument();
  });

  it("verifies the code and navigates", async () => {
    auth.verifyTwoFactor.mockResolvedValue(undefined);
    await reachChallenge();
    await userEvent.type(screen.getByLabelText(/authenticator code/i), "123456");
    await userEvent.click(screen.getByRole("button", { name: /verify and sign in/i }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/overview"));
    expect(auth.verifyTwoFactor).toHaveBeenCalledWith("u1", "123456", "ch1", false);
  });

  it("passes rememberDevice when ticked", async () => {
    auth.verifyTwoFactor.mockResolvedValue(undefined);
    await reachChallenge();
    await userEvent.type(screen.getByLabelText(/authenticator code/i), "123456");
    await userEvent.click(screen.getByLabelText(/remember this device/i));
    await userEvent.click(screen.getByRole("button", { name: /verify and sign in/i }));
    await waitFor(() => expect(auth.verifyTwoFactor).toHaveBeenCalledWith("u1", "123456", "ch1", true));
  });

  it("shows an error for a wrong code and stays on the step", async () => {
    auth.verifyTwoFactor.mockRejectedValue(new Error("Invalid code"));
    await reachChallenge();
    await userEvent.type(screen.getByLabelText(/authenticator code/i), "000000");
    await userEvent.click(screen.getByRole("button", { name: /verify and sign in/i }));
    expect(await screen.findByText("Invalid code")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Two-factor check" })).toBeInTheDocument();
  });

  it("limits the code to 6 digits", async () => {
    await reachChallenge();
    expect(screen.getByLabelText(/authenticator code/i)).toHaveAttribute("maxlength", "6");
  });
});

describe("LoginPage – first-time 2FA setup", () => {
  const setupResult = { requiresTwoFactor: false, requiresTwoFactorSetup: true, userId: "u1", twoFactorChallenge: "setup-ch" };

  async function reachSetup() {
    auth.login.mockResolvedValueOnce(setupResult);
    auth.setupTwoFactor.mockResolvedValue({ authenticatorUri: "otpauth://totp/x", sharedKey: "ABCD EFGH" });
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    await screen.findByRole("heading", { name: "Set up 2FA" });
  }

  it("requests setup details and shows the QR code and shared key", async () => {
    await reachSetup();
    expect(auth.setupTwoFactor).toHaveBeenCalledWith("setup-ch");
    expect(screen.getByText("ABCD EFGH")).toBeInTheDocument();
    expect(document.querySelector("svg[viewBox]")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete setup/i })).toBeInTheDocument();
  });

  it("finishes setup, signs in again and verifies when a second factor is then required", async () => {
    await reachSetup();
    auth.finishSetupTwoFactor.mockResolvedValue(undefined);
    auth.login.mockResolvedValueOnce({ requiresTwoFactor: true, userId: "u1", twoFactorChallenge: "next-ch" });
    auth.verifyTwoFactor.mockResolvedValue(undefined);
    await userEvent.type(screen.getByLabelText(/verification code/i), "654321");
    await userEvent.click(screen.getByRole("button", { name: /complete setup/i }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/overview"));
    expect(auth.finishSetupTwoFactor).toHaveBeenCalledWith("setup-ch", "654321");
    expect(auth.verifyTwoFactor).toHaveBeenCalledWith("u1", "654321", "next-ch");
  });

  it("goes straight to the overview if sign-in needs no further factor", async () => {
    await reachSetup();
    auth.finishSetupTwoFactor.mockResolvedValue(undefined);
    auth.login.mockResolvedValueOnce({ requiresTwoFactor: false });
    await userEvent.type(screen.getByLabelText(/verification code/i), "654321");
    await userEvent.click(screen.getByRole("button", { name: /complete setup/i }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/overview"));
    expect(auth.verifyTwoFactor).not.toHaveBeenCalled();
  });

  it("shows an error when the setup code is rejected", async () => {
    await reachSetup();
    auth.finishSetupTwoFactor.mockRejectedValue(new Error("Failed to verify code."));
    await userEvent.type(screen.getByLabelText(/verification code/i), "111111");
    await userEvent.click(screen.getByRole("button", { name: /complete setup/i }));
    expect(await screen.findByText("Failed to verify code.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows an error if the setup details cannot be fetched", async () => {
    auth.login.mockResolvedValueOnce(setupResult);
    auth.setupTwoFactor.mockRejectedValue(new Error("Failed to get setup details."));
    render(<LoginPage />);
    await fillCredentials();
    await submit();
    expect(await screen.findByText("Failed to get setup details.")).toBeInTheDocument();
  });
});
