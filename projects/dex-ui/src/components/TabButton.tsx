import styled from "styled-components";

export const TabButton = styled.button<{ active?: boolean; stretch?: boolean; bold?: boolean, justify?: boolean }>`
  display: flex;
  flex-direction: row;
  height: 48px;
  border: none;
  box-sizing: border-box;
  align-items: center;
  ${({ justify }) => justify && `justify-content: center;`}
  padding: 12px 16px;
  ${({ stretch }) => stretch && `width: 100%;`}
  font-weight: ${({ bold }) => (bold ? "600" : "normal")};
  z-index: ${({ active }) => (active ? "2" : "1")};
  outline: 0.5px solid ${({ active }) => (active ? "#000" : "#9CA3AF")};
  outline-offset: -0.5px;
  background-color: ${({ active }) => (active ? "#fff" : "#F9F8F6")};
  cursor: pointer;
`;
