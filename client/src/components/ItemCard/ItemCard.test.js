import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../App";
import ItemCard from "./ItemCard";
import axios from "axios";
import "@testing-library/jest-dom";
import { useNavigate } from "react-router-dom";

// Mock necessary components and modules
jest.mock("axios");
jest.mock("../DeleteItemDialog/DeleteItemDialog", () => (props) => (
  <div data-testid="delete-dialog" onClick={props.handleDeleteItem}>
    Delete Item Dialog
  </div>
));
jest.mock("../LoginDialog/LoginDialog", () => () => <div>Login Dialog</div>);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
const mockItem = {
  wishlistItemId: 1,
  name: "Sample Item",
  image: "path/to/image",
  description: "A brief description of the item",
  currentValue: 50,
  goalValue: 100,
  status: "active",
  endDate: new Date().toISOString(),
  creationTime: new Date().toISOString(),
  deadline: new Date().toISOString(),
  teacherId: 1,
};

const mockAuthUser = {
  userId: 1,
  accountType: "teacher",
  favoriteItems: [],
  votedSuggestions: [],
};

const mockAuthUserTeacher = {
  userId: 1,
  accountType: "teacher",
  favoriteItems: [],
  votedSuggestions: [],
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ItemCard", () => {
  const setReload = jest.fn();

  it("renders correctly with provided item data", () => {
    renderWithRouter(
      <AuthContext.Provider
        value={{ authUser: mockAuthUser, setReloadAuthUser: jest.fn() }}
      >
        <ItemCard
          item={mockItem}
          BACKEND_URL="http://mock-backend-url"
          setReload={setReload}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Sample Item")).toBeInTheDocument();
    expect(
      screen.getByText("A brief description of the item")
    ).toBeInTheDocument();

    const progressText = within(
      screen.getByRole("progressbar").parentNode
    ).getByText(/£50 \/ £100/);
    expect(progressText).toBeInTheDocument();
  });

  test("navigates to edit page when edit button is clicked", () => {
    renderWithRouter(
      <AuthContext.Provider
        value={{ authUser: mockAuthUserTeacher, setReloadAuthUser: jest.fn() }}
      >
        <ItemCard
          item={mockItem}
          BACKEND_URL="http://mock-backend-url"
          setReload={setReload}
        />
      </AuthContext.Provider>
    );

    const editButton = screen.getByRole("button", { name: "edit" });
    fireEvent.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      `item/${mockItem.wishlistItemId}/edit`
    );
  });
});
