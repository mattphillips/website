import React from "react";

type Theme = "light" | "dark";

type ThemeContext = { theme: Theme; toggle: () => void };

const ThemeContext = React.createContext<ThemeContext>({
  theme: "light",
  toggle: () => {},
});

export const useTheme = (): ThemeContext => React.useContext(ThemeContext);

export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setTheme(theme);
      document.body.className = "dark";
    } else {
      document.body.className = "light";
    }
  }, []);

  const toggle = () => {
    if (theme === "light") {
      document.body.className = "dark";
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.body.className = "light";
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};
