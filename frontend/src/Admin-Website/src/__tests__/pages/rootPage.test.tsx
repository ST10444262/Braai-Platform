import Home from "@/app/page";

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
import { redirect } from "next/navigation";

it("sends visitors of / to the login page", () => {
  Home();
  expect(redirect).toHaveBeenCalledWith("/login");
});
