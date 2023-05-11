import React from "react";
import { Route, Routes } from "react-router-dom";
import { NotFound } from "src/pages/404";
import { Home } from "src/pages/Home";
import { Dev } from "src/pages/Dev";
import { Well } from "src/pages/Well";
import { Wells } from "src/pages/Wells";
import { Frame } from "src/components/Frame/Frame";
import { Build } from "src/pages/Build";
import { SwapRoot } from "../Swap/SwapRoot";

export const App = ({}) => {
  return (
    <Frame>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/wells" element={<Wells />} />
        <Route path="/wells/:address" element={<Well />} />
        <Route path="/build" element={<Build />} />
        <Route path="/swap" element={<SwapRoot />} />
        <Route path="/dev" element={<Dev />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Frame>
  );
};
