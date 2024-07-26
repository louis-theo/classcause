import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Form from "./Form";
import axios from "axios";
import { toast } from "sonner";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../../../../App";

jest.mock("axios");
jest.mock("sonner");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock context

const MockProvider = ({ children }) => {
  const authValue = {
    setAuthUser: jest.fn(),
    setIsLoggedIn: jest.fn(),
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

const BACKEND_URL = "http://mock-backend-url";

describe("Form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("renders with correct initial values", () => {
    const { getByLabelText } = render(
      <BrowserRouter>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </BrowserRouter>
    );

    expect(getByLabelText(/first name \*/i).value).toBe("");
    expect(getByLabelText(/last name \*/i).value).toBe("");
    expect(getByLabelText(/email \*/i).value).toBe("");
    expect(getByLabelText(/password \*/i).value).toBe("");
    expect(getByLabelText(/mobile\*/i).value).toBe("");
  });

  test("validates input fields correctly", async () => {
    const { getByLabelText, getByText, getByRole } = render(
      <BrowserRouter>
        <MockProvider>
          <Form BACKEND_URL="http://localhost" />
        </MockProvider>
      </BrowserRouter>
    );

    fireEvent.change(getByLabelText(/email \*/i), {
      target: { value: "wrongemail" },
    });
    fireEvent.change(getByLabelText(/password \*/i), {
      target: { value: "123" },
    }); // Too short
    fireEvent.submit(getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        getByText(/the password should have at minimum length of 8/i)
      ).toBeInTheDocument();
    });
  });

  test("conditionally renders school and group fields for teachers", async () => {
    render(
      <BrowserRouter>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </BrowserRouter>
    );

    // Open the account type dropdown and select "teacher"
    fireEvent.mouseDown(screen.getByLabelText(/accountType\*/i));
    await waitFor(() => screen.getByRole("option", { name: "teacher" }));
    fireEvent.click(screen.getByRole("option", { name: "teacher" }));

    // Wait for the UI to update and the "school" and "group" fields to be available
    await waitFor(() => {
      const schoolField = screen.getByLabelText(/school\*/i);
      expect(schoolField).toBeInTheDocument();

      const groupField = screen.getByLabelText("Group");
      expect(groupField).toBeInTheDocument();
    });
  });
});
