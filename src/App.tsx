import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { router } from './routes';

function App() {
  return (
    <>
      <Toaster richColors closeButton />
      <AuthProvider>
        <DataProvider>
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </>
  );
}

export default App;
