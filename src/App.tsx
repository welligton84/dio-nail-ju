import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './routes';

function App() {
  return (
    <>
      <Toaster richColors closeButton />
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <RouterProvider router={router} />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
