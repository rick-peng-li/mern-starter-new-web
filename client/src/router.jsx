import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { PostDetailPage } from './pages/PostDetailPage.jsx';
import { PostEditorPage } from './pages/PostEditorPage.jsx';
import { ProtectedRoute } from './ui/ProtectedRoute.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { TaxonomyPage } from './pages/TaxonomyPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'posts/:postId',
        element: <PostDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'posts/new',
            element: <PostEditorPage mode="create" />,
          },
          {
            path: 'posts/:postId/edit',
            element: <PostEditorPage mode="edit" />,
          },
          {
            path: 'manage/taxonomy',
            element: <TaxonomyPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
