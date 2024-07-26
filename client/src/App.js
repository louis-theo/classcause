import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

import LoginPage from "./pages/AuthPages/LoginPage/LoginPage";
import SignupPage from "./pages/AuthPages/SignupPage/SignupPage";
import ForgotPasswordPage from "./pages/AuthPages/ForgotPasswordPage/ForgotPassword";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage/ResetPassword";
import AddItemPage from "./pages/AddItemPage/AddItemPage";
import EditItemPage from "./pages/EditItemPage/EditItemPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import NotificationPage from "./pages/NotificationPage/NotificationPage";
import axios from "axios";
import AddStory from "./components/AddStory/AddStory";
import EditStory from "./components/EditStory/EditStory";
import AddAdvertisement from "./components/AdvertisementAdd/AdvertisementAdd";
import Header from "./components/Header/Header";
import ClassroomPage from "./pages/ClassroomPage/ClassroomPage";
import WishlistItemDetails from "./components/WishlistItemDetails/WishlistItemDetails";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";
import Discover from "./pages/Discover/Discover";
import FavouritesPage from "./pages/FavouritesPage/FavouritesPage";
import CheckUnsuccessfulItems from "./components/Notification/CheckUnsuccessfulItems";
import CheckUnsuccessfulBids from "./components/Notification/CheckUnsuccessfulBid";
import TeacherDashboard from "./pages/TeacherMetrics/TeacherMetrics";
import DispatchInfoPage from "./pages/DispatchInfoPage/DispatchInfoPage";
import DispatchItemDetails from "./pages/DispatchItemDetails/DispatchItemDetails";
import MyDonationsPage from "./pages/MyDonations/MyDonations";
import AdminUpdatedDashboard from "./pages/AdminAnalytics/AdminDashboardUpdated";
import MySuggestionsPage from "./pages/MySuggestionsPage/MySuggestionsPage";
import StripePaymentPage from "./pages/StripePaymentPage/StripePaymentPage";
import DonationSuccessPage from "./pages/DonationSuccessPage/DonationSuccess";
import StripeReturnPage from "./pages/StripeReturnPage/StripeReturnPage";
import PayoutSuccessPage from "./pages/PayoutSuccessPage/PayoutSuccess";
import NotFound from "./pages/ErrorPages/NotFound";
import SuccessStoriesPage from "./pages/SuccessStoriesPage/SuccessStoriesPage";
import StoryDetails from "./pages/StoryDetails/StoryDetails";
import AdvertisementPage from "./pages/AdvertisementPage/AdvertisementPage";
import EditAd from "./pages/EditAdPage/components/Form";
import AdDetails from "./pages/AdDetailsPage/AdDetails";
import MyBidsPage from "./pages/MyBidsPage/MyBidsPage";
import ProtectedRoute from "./utils/ProtectedRoute";
import Privacy from "./pages/Privacy/Privacy";
import Footer from "./components/Footer/Footer";

export const AuthContext = createContext(undefined);

function App() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // context set up
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reloadAuthUser, setReloadAuthUser] = useState(false);

  const logoutAfterMillis = 10800000; // 3 hours

  // Logout after a period of inactivity
  useEffect(() => {
    let timer;
    if (isLoggedIn) {
      timer = setTimeout(() => {
        handleLogout();
        toast.warning("You have been logged out due to inactivity.");
      }, logoutAfterMillis);

      // timer on user activity
      const events = ["click", "load", "keydown"];
      const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          handleLogout();
          alert("You have been logged out due to inactivity.");
        }, logoutAfterMillis);
      };

      for (let event of events) {
        window.addEventListener(event, resetTimer);
      }

      return () => {
        clearTimeout(timer);
        for (let event of events) {
          window.removeEventListener(event, resetTimer);
        }
      };
    }
  }, [isLoggedIn]);

  // logout
  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("role");

    setIsLoggedIn(false);
    setAuthUser(null);
  };
  // set values accessible in context
  const value = {
    authUser,
    setAuthUser,
    isLoggedIn,
    setIsLoggedIn,
    handleLogout,
    setReloadAuthUser,
    BACKEND_URL,
  };

  // get user data
  const authToken = sessionStorage.getItem("authToken");
  const getUserData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/users/profile`, {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      setAuthUser(response.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  // retireve new user data if authToken changes
  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
      getUserData();
    } else {
      setIsLoggedIn(false);
      setAuthUser(null);
    }
  }, [authToken, reloadAuthUser]);

  return (
    <AuthContext.Provider value={value}>
      <Toaster richColors />
      <BrowserRouter>
        <Header />
        <CheckUnsuccessfulItems />
        <CheckUnsuccessfulBids />
        <Routes>
          {/* ----PUBLIC ROUTES---- */}
          {/* NOT FOUND PAGE */}
          <Route path="/*" element={<NotFound />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* PRIVACY */}
          <Route path="/page-privacy" element={<Privacy />} />

          {/* LOGIN AND REGISTER */}
          <Route
            path="/login"
            element={<LoginPage BACKEND_URL={BACKEND_URL} />}
          />
          <Route
            path="/signup"
            element={<SignupPage BACKEND_URL={BACKEND_URL} />}
          />
          <Route
            path="/page-forgot-password"
            element={<ForgotPasswordPage BACKEND_URL={BACKEND_URL} />}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage BACKEND_URL={BACKEND_URL} />}
          />

          {/* MAIN PAGE - DISCOVER */}
          <Route path="/" element={<Discover BACKEND_URL={BACKEND_URL} />} />
          <Route path="/discover" element={<Navigate to="/" replace />} />

          {/* CLASSROOM - NON TEACHES VIEW*/}
          <Route
            path="/classroom/:teacherId"
            element={<ClassroomPage BACKEND_URL={BACKEND_URL} />}
          />

          {/* ITEM DETAILS NON TEACHER VIEW */}
          <Route
            path="/classroom/:teacherId/item/:wishlistItemId"
            element={<WishlistItemDetails BACKEND_URL={BACKEND_URL} />}
          />
          <Route
            path="/notification"
            element={<NotificationPage BACKEND_URL={BACKEND_URL} />}
          />

          {/* OTHER PEOPLE'S PROFILE */}
          <Route
            path="/profile/:profileId"
            element={<ProfilePage BACKEND_URL={BACKEND_URL} />}
          />

          {/* SUCCESS STORIES */}
          <Route
            path="/success-stories"
            element={<SuccessStoriesPage BACKEND_URL={BACKEND_URL} />}
          />

          {/* SUCCESS STORIES DETAILS*/}
          <Route
            path="/success-stories/:storyId"
            element={<StoryDetails BACKEND_URL={BACKEND_URL} />}
          />

          {/* ADVERTISING */}
          <Route
            path="/advertisement"
            element={<AdvertisementPage BACKEND_URL={BACKEND_URL} />}
          />

          {/* ADVERTISING DETAILS*/}
          <Route
            path="/advertisement/:advertisementId"
            element={<AdDetails BACKEND_URL={BACKEND_URL} />}
          />

          {/* PAYMENT HANDLING */}
          <Route path="/stripe-payment" element={<StripePaymentPage />} />
          <Route path="/donation-success" element={<DonationSuccessPage />} />
          <Route
            path="/stripe-return"
            element={<StripeReturnPage BACKEND_URL={BACKEND_URL} />}
          />
          <Route path="/payout-success" element={<PayoutSuccessPage />} />

          {/* ----LOGGED IN USERS ACCESS---- */}
          <Route element={<ProtectedRoute />}>
            {/* PROFILE */}
            <Route
              path="/profile"
              element={<ProfilePage BACKEND_URL={BACKEND_URL} />}
            />
            {/* PROFILE EDIT */}
            <Route
              path="/profile/edit"
              element={<ProfileEdit BACKEND_URL={BACKEND_URL} />}
            />

            {/* FAVOURITES PAGE */}
            <Route
              path="/favourites"
              element={<FavouritesPage BACKEND_URL={BACKEND_URL} />}
            />
          </Route>

          {/* ----PARENTS ACCESS---- */}
          <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
            {/* EDIT SUGGESTIONS */}
            <Route
              path="/suggestions/:itemId/edit"
              element={<EditItemPage BACKEND_URL={BACKEND_URL} />}
            />
            {/* ADD SUGGESTIONS*/}
            <Route
              path="/classroom/:teacherId/items/add"
              element={<AddItemPage BACKEND_URL={BACKEND_URL} />}
            />
            {/* PARENT SUGGESTIONS PAGE */}
            <Route
              path="/my-suggestions"
              element={<MySuggestionsPage BACKEND_URL={BACKEND_URL} />}
            />
          </Route>

          {/* ------SCHOOL AND TEACHER ACCESS------ */}
          <Route
            element={<ProtectedRoute allowedRoles={["teacher", "school"]} />}
          >
            {/* TEACHER ANALYTICS */}
            <Route
              path="/teacher-analytics"
              element={<TeacherDashboard BACKEND_URL={BACKEND_URL} />}
            />

            {/* MY CLASSROOM/ MY SCHOOL */}
            <Route
              path="/classroom"
              element={<ClassroomPage BACKEND_URL={BACKEND_URL} />}
            />

            {/* ITEM DETAILS FOR TEACHERS */}
            <Route
              path="/classroom/item/:wishlistItemId"
              element={<WishlistItemDetails BACKEND_URL={BACKEND_URL} />}
            />

            {/* ADD ITEM FOR TEACHERS */}
            <Route
              path="/classroom/items/add"
              element={<AddItemPage BACKEND_URL={BACKEND_URL} />}
            />

            {/* SUCCESS STORIES ADD */}
            <Route
              path="/success-stories/add"
              element={<AddStory BACKEND_URL={BACKEND_URL} />}
            />
            <Route
              path="/:itemId/success-stories/add"
              element={<AddStory BACKEND_URL={BACKEND_URL} />}
            />
          </Route>

          {/* -----TEACHER, SCHOOL, ADMIN ACESS */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["teacher", "school", "admin"]} />
            }
          >
            {/* EDIT ITEM */}
            <Route
              path="/classroom/item/:itemId/edit"
              element={<EditItemPage BACKEND_URL={BACKEND_URL} />}
            />
            {/* STORY EDIT*/}
            <Route
              path="/success-stories/:storyId/edit/"
              element={<EditStory BACKEND_URL={BACKEND_URL} />}
            />
          </Route>

          {/* ----SCHOOL ACCESS---- */}
          <Route
            element={<ProtectedRoute allowedRoles={["school", "admin"]} />}
          >
            {/* EDIT AD */}
            <Route
              path="/advertisement/:advertisementId/edit"
              element={<EditAd BACKEND_URL={BACKEND_URL} />}
            />
            <Route element={<ProtectedRoute allowedRoles={["school"]} />}>
              {/* ADD AD */}
              <Route
                path="/advertisement/add"
                element={<AddAdvertisement BACKEND_URL={BACKEND_URL} />}
              />
            </Route>
          </Route>

          {/* ----ADMIN---- */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin-dashboard"
              element={<AdminUpdatedDashboard BACKEND_URL={BACKEND_URL} />}
            />

            {/* ADMIN DISPATCH PAGE */}
            <Route
              path="/dispatch-items"
              element={<DispatchInfoPage BACKEND_URL={BACKEND_URL} />}
            />
            <Route
              path="/dispatch-items/:itemId"
              element={<DispatchItemDetails BACKEND_URL={BACKEND_URL} />}
            />
          </Route>

          {/* ------BUSINESS AND PARENT----- */}
          <Route
            element={<ProtectedRoute allowedRoles={["business", "parent"]} />}
          >
            {/* PAST DONATIONS */}
            <Route
              path="/my-donations"
              element={<MyDonationsPage BACKEND_URL={BACKEND_URL} />}
            />
          </Route>

          {/* ----BUSINESS ACCESS---- */}
          <Route element={<ProtectedRoute allowedRoles={["business"]} />}>
            {/* BUSINESS ADS */}
            <Route
              path="/my-bids"
              element={<MyBidsPage BACKEND_URL={BACKEND_URL} />}
            />
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
export default App;
