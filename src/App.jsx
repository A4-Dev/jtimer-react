import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import TabataTimerApp from './TabataTimerApp'; // <- Adjust path if needed

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TabataTimerApp darkMode={darkMode} setDarkMode={setDarkMode} />
    </ThemeProvider>
  );
}
