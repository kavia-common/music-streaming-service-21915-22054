import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";

test("renders navbar links", () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Search/i)).toBeInTheDocument();
  expect(screen.getByText(/Playlists/i)).toBeInTheDocument();
});
