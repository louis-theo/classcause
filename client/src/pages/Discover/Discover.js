import React from "react";
import items from "./components/carousel-pics";
import Hero from "./components/Hero";
import MainLists from "./components/MainLists";

const Discover = ({ BACKEND_URL }) => {
  return (
    <>
      <Hero items={items} />
      <MainLists BACKEND_URL={BACKEND_URL} />
    </>
  );
};

export default Discover;
