import React from "react";
import Box from "@mui/material/Box";
import Container from "../../../common/Container";
import { Form } from "./components";

const SignupPage = ({ BACKEND_URL }) => {
  return (
    <Box
      position={"relative"}
      minHeight={"calc(100vh - 247px)"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      height={"100%"}
    >
      <Container maxWidth={600}>
        <Form BACKEND_URL={BACKEND_URL} />
      </Container>
    </Box>
  );
};

export default SignupPage;
