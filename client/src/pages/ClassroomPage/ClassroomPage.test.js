import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../App";
import ClassroomPage from "./ClassroomPage";

// Mocks
jest.mock("axios");
jest.mock("../../components/LoginDialog/LoginDialog", () => () => (
  <div>LoginDialog</div>
));
jest.mock("../../components/ItemCard/ItemCard", () => () => (
  <div>ItemCard</div>
));

const mockAuthValue = {
  authUser: {
    userId: 1,
    accountType: "teacher",
    favoriteClassrooms: [1, 2, 3],
  },
  setReloadAuthUser: jest.fn(),
};

let currentTab = "all";

axios.get.mockImplementation((url) => {
  if (url.includes("/wishlists/")) {
    if (currentTab === "completed") {
      return Promise.resolve({
        data: [{ name: "Item 2", status: "completed" }],
      });
    } else {
      return Promise.resolve({ data: mockItems });
    }
  }
  return Promise.reject(new Error("not found"));
});

const mockItems = [
  { name: "Item 1", status: "active" },
  { name: "Item 2", status: "completed" },
];

axios.get.mockResolvedValue({ data: mockItems });

describe("ClassroomPage", () => {
  const setup = async () => {
    const utils = render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <ClassroomPage BACKEND_URL="http://mock-backend-url" />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/My classroom wishlist/)).toBeInTheDocument()
    );
    return utils;
  };

  test("fetches items and displays them on mount", async () => {
    setup();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText("ItemCard").length).toBe(mockItems.length);
    });
  });

  test("changes displayed items when tabs are changed", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getAllByText("ItemCard").length).toBe(mockItems.length);
    });

    // Change tab to 'completed'
    currentTab = "completed";
    const completedTab = screen.getByRole("tab", { name: /completed/i });
    fireEvent.click(completedTab);

    await waitFor(() => {
      const updatedItems = screen.getAllByText("ItemCard");
      expect(updatedItems.length).toBe(1);
    });
  });
});
