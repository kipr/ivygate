import { styled } from "styletron-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faCoffee } from '@fortawesome/free-solid-svg-icons'; // Import faCoffee
import * as React from "react";

// Styled component
const TestDiv = styled("div", {
  backgroundColor: "pink",
  width: "100px",
  height: "100px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export default function TestStyled() {
  return (
    <TestDiv>
      <FontAwesomeIcon icon={faCoffee} />
    </TestDiv>
  );
}
