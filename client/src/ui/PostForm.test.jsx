import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PostForm } from './PostForm.jsx';

describe('PostForm', () => {
  it('hydrates post data and normalizes tag input on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PostForm
        post={{
          title: 'Existing title',
          summary: 'Existing summary for editing',
          content: '## Existing content',
          author: 'Editor',
          category: 'Architecture',
          tags: ['react', 'vite'],
          status: 'draft',
          coverImage: '',
          contentFormat: 'markdown',
        }}
        onSubmit={onSubmit}
        isSubmitting={false}
        currentUser={{ name: 'Editor' }}
        categories={[]}
        tags={[]}
        onUploadImage={vi.fn()}
        uploadError=""
        isUploading={false}
      />
    );

    await user.clear(screen.getByLabelText(/Tags/i));
    await user.type(screen.getByLabelText(/Tags/i), 'react, vite, testing');
    await user.click(screen.getByRole('button', { name: /Save Post/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Existing title',
        tags: ['react', 'vite', 'testing'],
        author: 'Editor',
        contentFormat: 'markdown',
      })
    );
  });
});
