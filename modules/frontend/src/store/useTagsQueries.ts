
import { CreateCustomTagDTO } from '@/model/tags/TagsDTO';
import { createCustomTag, deleteCustomTag, getAllCustomTags, updateCustomTag } from '@/service/tags/CustomTagService';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'sonner';

export const useTagsQueries = () => {
  const queryClient = useQueryClient();

  // Query para obtener todos los tags
  const {
    data: tags = [],
    isLoading: isLoadingTags,
    error: tagsError
  } = useQuery({
    queryKey: ['custom-tags'],
    queryFn: getAllCustomTags,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para crear tag
  const createTagMutation = useMutation({
    mutationFn: createCustomTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-tags'] });
      toast.success('Tag creado exitosamente');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Error al crear el tag: ' + errorMessage);
    },
  });

  // Mutation para actualizar tag
  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCustomTagDTO }) =>
      updateCustomTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-tags'] });
      toast.success('Tag actualizado exitosamente', { duration: 1500 });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Error al actualizar el tag: ' + errorMessage);
    },
  });

  // Mutation para eliminar tag
  const deleteTagMutation = useMutation({
    mutationFn: deleteCustomTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-tags'] });
      toast.success('Tag eliminado exitosamente');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Error al eliminar el tag: ' + errorMessage);
    },
  });

  return {
    tags,
    isLoadingTags,
    tagsError,
    createTag: createTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    isCreating: createTagMutation.isLoading,
    isUpdating: updateTagMutation.isLoading,
    isDeleting: deleteTagMutation.isLoading,
  };
};
