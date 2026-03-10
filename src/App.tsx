import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { router } from './routes';

function App() {
  return (
    <>
      <Toaster richColors closeButton />
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <SettingsProvider>
              <RouterProvider router={router} />
            </SettingsProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
