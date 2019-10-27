import React from "react";
import ReactDOM from "react-dom";
import BlockStreamClient from "./BlockStreamClient";

import "./styles.css";

function App() {
  return <BlockStreamClient n={5} nodeRadius={10} ringRadius={100} />;
}

const rootElement = document.getElementById("root");
console.log(rootElement);
ReactDOM.render(<App />, rootElement);
