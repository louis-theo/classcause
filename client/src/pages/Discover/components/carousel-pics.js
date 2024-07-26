const items = [
  {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    title: "Join Our Mission",
    reference: "AD OPPORTUNITIES",
    description:
      "Our partners are the backbone of our efforts to empower education. Join us in making a tangible impact on communities worldwide.",
    buttonText: "Become a Partner",
    buttonLink: "/advertisement",
  },
  {
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    title: "Supporting Future Generations",
    reference: "DISCOVER ",
    description:
      "Discover how your donations open up a world of opportunities for students and teachers alike.",
    buttonText: "Discover Opportunities",
    buttonAction: () => {
      document
        .getElementById("discover-list")
        .scrollIntoView({ behavior: "smooth" });
    },
  },
  {
    image: "https://images.pexels.com/photos/5212335/pexels-photo-5212335.jpeg",
    title: "Every Contribution Counts",
    reference: "SUCCESS STORIES",
    description:
      "Your support creates stories of success and change. Explore these inspiring journeys.",
    buttonText: "View Success Stories",
    buttonLink: "/success-stories",
  },
  {
    image: "https://images.pexels.com/photos/256468/pexels-photo-256468.jpeg",
    title: "Empower Through Education",
    reference: "BECOME PART OF THE COMMUNITY",
    description:
      "Are you a teacher or represent a school? Partner with us to bring resources and opportunities to your classroom.",
    buttonText: "Register Now",
    buttonLink: "/signup",
  },
];

export default items;
