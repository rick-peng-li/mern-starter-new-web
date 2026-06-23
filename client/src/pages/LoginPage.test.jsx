import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage.jsx';

const loginMock = vi.fn();

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('submits credentials through the auth context', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ name: 'Editor' });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText(/Email/i));
    await user.type(screen.getByLabelText(/Email/i), 'editor@example.com');
    await user.clear(screen.getByLabelText(/Password/i));
    await user.type(screen.getByLabelText(/Password/i), 'Editor12345');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(loginMock).toHaveBeenCalledWith({
      email: 'editor@example.com',
      password: 'Editor12345',
    });
  });
});
