import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";

const Container = ({ children, ...rest }) => (
  <Box
    maxWidth={{ xs: 270, sm: 550, md: 860, lg: 1024 }}
    width={"100%"}
    margin={"0 auto"}
    marginTop={5}
    paddingX={2}
    paddingY={{ xs: 4, sm: 6, md: 8 }}
    {...rest}
  >
    {children}
  </Box>
);

Container.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Container;
