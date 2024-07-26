import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import AdDetails from "./AdDetails";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../App";
import axios from "axios";
import { toast } from "sonner";

jest.mock("axios");
jest.mock("sonner");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ advertisementId: "1" }),
}));

jest.mock("../../components/Notification/BidNoti", () => () => ({
  addBid: jest.fn().mockImplementation(() =>
    Promise.resolve({
      messageTitle: "Bid Successful",
      messageContent: "You have successfully placed a bid.",
    })
  ),
}));

const mockAdDetails = {
  advertisementId: "1",
  title: "Test Ad",
  details: "Details of the test ad",
  image: "path/to/image.jpg",
  status: "active",
  schoolId: 1,
  schoolName: "Test School",
  startingPrice: 100,
  highestBiddingPrice: 150,
};

const renderWithAuth = (authUser) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          authUser,
          isLoggedIn: true,
          BACKEND_URL: "http://mock-backend-url",
        }}
      >
        <AdDetails />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe("AdDetails Component", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        advertisement: mockAdDetails,
        bids: [],
        highestBidder: null,
      },
    });
    axios.post.mockResolvedValue({
      data: { success: true, message: "Bid successfully submitted" },
    });
  });

  it("fetches ad details and displays them", async () => {
    renderWithAuth({ userId: 1, accountType: "school" });
    await waitFor(() => {
      expect(screen.getByText("Test Ad")).toBeInTheDocument();
      expect(screen.getByText("Details of the test ad")).toBeInTheDocument();
    });
  });

  it("allows a business user to open and submit bid dialog", async () => {
    const mockBusinessUser = {
      userId: 2,
      accountType: "business",
    };
    renderWithAuth(mockBusinessUser);

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /open bid dialog/i }));
    });

    await waitFor(() => {
      const bidAmountInput = screen.getByLabelText(/Bid Amount \(£\)/i);
      fireEvent.change(bidAmountInput, { target: { value: 200 } });
      fireEvent.click(screen.getByText(/submit bid/i));
    });

    expect(axios.post).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Bid submitted");
  });

  it("prevents a non-business user from submitting bids and shows warning", async () => {
    const mockNonBusinessUser = {
      userId: 3,
      accountType: "teacher",
    };
    renderWithAuth(mockNonBusinessUser);
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Add bid/i));
      expect(toast.warning).toHaveBeenCalledWith(
        "You need to have a business account"
      );
    });
  });
});
