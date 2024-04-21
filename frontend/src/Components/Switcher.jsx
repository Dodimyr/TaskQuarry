import { useState } from "react";
import useDarkMode from "../Hooks/useDarkMode";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { Button, IconButton } from "@material-tailwind/react";
export default function Switcher() {
  const [colorTheme, setTheme] = useDarkMode();
  const [darkMode, setDarkMode] = useState(
    colorTheme === "light" ? true : false
  );

  const [isToggled, setToggled] = useState(false);

  const handleToggleDarkMode = () => {
    setToggled(true);
    setTheme(colorTheme);
    setDarkMode(true);
    setTimeout(() => setToggled(false), 950);
  };
  return (
    <>
      <IconButton
        variant="filled"
        size="sm"
        onClick={handleToggleDarkMode}
        className={`rounded-full mr-2 ${isToggled ? "animate-spin" : ""}`}
      >
        {darkMode ? (
          <MoonIcon className="h-5 w-5 text-white" />
        ) : (
          <SunIcon className="h-5 w-5" />
        )}
      </IconButton>
    </>
  );
}
