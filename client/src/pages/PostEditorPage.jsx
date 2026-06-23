import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, fetchCategories, fetchPost, fetchTags, updatePost, uploadImage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PostForm } from '../ui/PostForm.jsx';

export function PostEditorPage({ mode }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditMode = mode === 'edit';

  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    enabled: isEditMode,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEditMode) {
        return updatePost(postId, payload);
      }
      return createPost(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['post', response.item.publicId] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      navigate(`/posts/${response.item.publicId}`);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
  });

  if (isEditMode && postQuery.isLoading) {
    return <section className="card">Loading editor...</section>;
  }

  if (isEditMode && postQuery.isError) {
    return <section className="card error-card">{postQuery.error.message}</section>;
  }

  return (
    <div className="page-stack">
      <PostForm
        post={postQuery.data?.item}
        onSubmit={(payload) => mutation.mutate(payload)}
        isSubmitting={mutation.isPending}
        currentUser={user}
        categories={categoriesQuery.data?.items || []}
        tags={tagsQuery.data?.items || []}
        onUploadImage={(file) => uploadMutation.mutateAsync(file)}
        uploadError={uploadMutation.error?.message || ''}
        isUploading={uploadMutation.isPending}
      />
      {mutation.isError ? <section className="card error-card">{mutation.error.message}</section> : null}
    </div>
  );
}
