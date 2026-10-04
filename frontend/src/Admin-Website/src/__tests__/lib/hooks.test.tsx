import { renderHook, waitFor, act } from "@testing-library/react";
import { useLoad, useProductNames, useStaffDirectory } from "@/lib/hooks";
import { makeAuth } from "../helpers/testUtils";

jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const get = api.get as jest.Mock;
const mockAuth = useAuth as jest.Mock;

beforeEach(() => jest.resetAllMocks());

describe("useLoad", () => {
  it("starts loading then exposes data", async () => {
    const fn = jest.fn().mockResolvedValue("hello");
    const { result } = renderHook(() => useLoad(fn));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("hello");
    expect(result.current.error).toBeNull();
  });

  it("exposes the error message on failure", async () => {
    const { result } = renderHook(() => useLoad(() => Promise.reject(new Error("kaboom"))));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("kaboom");
    expect(result.current.data).toBeNull();
  });

  it("reload() runs the loader again", async () => {
    const fn = jest.fn().mockResolvedValueOnce("one").mockResolvedValueOnce("two");
    const { result } = renderHook(() => useLoad(fn));
    await waitFor(() => expect(result.current.data).toBe("one"));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe("two"));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("re-runs when deps change", async () => {
    const fn = jest.fn((id: string) => Promise.resolve(id));
    const { result, rerender } = renderHook(({ id }) => useLoad(() => fn(id), [id]), { initialProps: { id: "a" } });
    await waitFor(() => expect(result.current.data).toBe("a"));
    rerender({ id: "b" });
    await waitFor(() => expect(result.current.data).toBe("b"));
  });

  it("ignores results that arrive after unmount", async () => {
    let resolve!: (v: string) => void;
    const fn = () => new Promise<string>((r) => (resolve = r));
    const { result, unmount } = renderHook(() => useLoad(fn));
    unmount();
    await act(async () => resolve("late"));
    expect(result.current.data).toBeNull();
  });
});

describe("useProductNames", () => {
  it("maps productId to name", async () => {
    mockAuth.mockReturnValue(makeAuth("Admin"));
    get.mockResolvedValue([{ productId: "p1", name: "Big Braai" }, { productId: "p2", name: "Cosy Fire" }]);
    const { result } = renderHook(() => useProductNames());
    await waitFor(() => expect(result.current).toEqual({ p1: "Big Braai", p2: "Cosy Fire" }));
    expect(get).toHaveBeenCalledWith("/admin/products?pageNumber=1&pageSize=1000");
  });

  it("returns an empty map when the request fails", async () => {
    get.mockRejectedValue(new Error("no"));
    const { result } = renderHook(() => useProductNames());
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current).toEqual({});
  });
});

describe("useStaffDirectory", () => {
  it("maps staffId to staff for admins", async () => {
    mockAuth.mockReturnValue(makeAuth("Admin"));
    get.mockResolvedValue([{ staffId: "s1", fullName: "Ann" }]);
    const { result } = renderHook(() => useStaffDirectory());
    await waitFor(() => expect(result.current).toEqual({ s1: { staffId: "s1", fullName: "Ann" } }));
    expect(get).toHaveBeenCalledWith("/admin/account/staff?pageNumber=1&pageSize=1000");
  });

  it("does not call the API for employees", async () => {
    mockAuth.mockReturnValue(makeAuth("Employee"));
    const { result } = renderHook(() => useStaffDirectory());
    await waitFor(() => expect(result.current).toEqual({}));
    expect(get).not.toHaveBeenCalled();
  });

  it("returns an empty map when the request fails", async () => {
    mockAuth.mockReturnValue(makeAuth("Admin"));
    get.mockRejectedValue(new Error("403"));
    const { result } = renderHook(() => useStaffDirectory());
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current).toEqual({});
  });
});
