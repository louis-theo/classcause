const getRoleBasedPages = (role, userId) => {
  switch (role) {
    case "teacher":
      return [
        { title: "Discover", href: "/" },
        { title: "My Classroom", href: `/classroom` },
        { title: "Success Stories", href: "/success-stories" },
        { title: "Analytics", href: "/teacher-analytics" },
      ];
    case "school":
      return [
        { title: "Discover", href: "/" },
        { title: "My School", href: "/school" },
        { title: "Success Stories", href: "/success-stories" },
        { title: "My Ads", href: "/advertisement" },
        { title: "Analytics", href: "/analytics" },
      ];
    case "parent":
      return [
        { title: "Discover", href: "/discover" },
        { title: "Favourites", href: "/favourites" },
        { title: "Success Stories", href: "/success-stories" },
        { title: "My Suggestions", href: "/my-suggestions" },
        { title: "My donations", href: "/my-donations" },
      ];
    case "business":
      return [
        { title: "Discover", href: "/discover" },
        { title: "Advertisement Opportunities", href: "/advertisement" },

        { title: "Favourites", href: "/favourites" },
        { title: "Success Stories", href: "/success-stories" },
        { title: "My Bids", href: "/my-bids" },
        { title: "My donations", href: "/my-donations" },
      ];
    case "admin":
      return [
        { title: "Discover", href: "/discover" },
        { title: "Dispatch Items", href: "/dispatch-items" },
        { title: "Success Stories", href: "/success-stories" },
        { title: "Fees and Analytics", href: "/admin-dashboard" },
      ];
    case null:
      return [
        { title: "Discover", href: "/discover" },
        { title: "Success Stories", href: "/success-stories" },
        { title: "For partners", href: "/advertisement" },
      ];
    default:
      return [
        { title: "Discover", href: "/discover" },
        { title: "Success Stories", href: "/success-stories" },
        { title: "For partners", href: "/advertisement" },
      ];
  }
};

export const getNavigationPages = (role) => {
  return [
    {
      title: "Browse",
      pages: [...getRoleBasedPages(role)],
    },
  ];
};
