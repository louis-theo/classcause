import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Form from "./Form";
import axios from "axios";
import { toast } from "sonner";
import { BrowserRouter as Router } from "react-router-dom";
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
    render(
      <Router>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </Router>
    );

    // Assertions to ensure the form renders correctly
    expect(screen.getByLabelText(/email \*/i).value).toBe("");
    expect(screen.getByLabelText(/password \*/i).value).toBe("");
  });

  test("validates input fields correctly", async () => {
    render(
      <Router>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </Router>
    );

    fireEvent.input(screen.getByLabelText(/email \*/i), {
      target: {
        value: "wrongemail",
      },
    });
    fireEvent.input(screen.getByLabelText(/password \*/i), {
      target: {
        value: "123", // Too short
      },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/the password should have at minimum length of 8/i)
      ).toBeInTheDocument();
    });
  }, 10000);

  test("submits form and navigates on success", async () => {
    const loginResponse = {
      data: { authToken: "token123", accountType: "admin" },
    };
    const userProfile = { data: { userId: "1", accountType: "admin" } };

    axios.post.mockResolvedValueOnce(loginResponse);
    axios.get.mockResolvedValueOnce(userProfile);

    render(
      <Router>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password \*/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/admin-dashboard");
        expect(toast.success).toHaveBeenCalledWith("You are now logged in!");
      },
      { timeout: 5000 }
    );
  });

  test("handles API error during login", async () => {
    const errorMessage = "Invalid credentials";
    axios.post.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    render(
      <Router>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password \*/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Error logging in: ${errorMessage}`
      );
    });
  });
  test("navigates based on user role (teacher)", async () => {
    const loginResponse = {
      data: { authToken: "token123", accountType: "teacher" },
    };
    const userProfile = {
      data: { userId: "1", accountType: "teacher" },
    };

    axios.post.mockResolvedValueOnce(loginResponse);
    axios.get.mockResolvedValueOnce(userProfile);

    render(
      <Router>
        <MockProvider>
          <Form BACKEND_URL={BACKEND_URL} />
        </MockProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email \*/i), {
      target: { value: "teacher@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password \*/i), {
      target: { value: "password123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/classroom");
      },
      { timeout: 5000 }
    );
  });
});
