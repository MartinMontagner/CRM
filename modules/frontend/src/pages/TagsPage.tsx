import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import NavbarLayout from '@/components/layout/NavbarLayout';
import { CustomTag } from '@/model/chats/Contact';
import { useTagsQueries } from '@/store/useTagsQueries';
import { TagsSkeleton } from '@/components/tags/TagsSkeleton';
import { TagCard } from '@/components/tags/TagCard';
import { TagFormModal } from '@/components/tags/TagFormModal';
import { CreateCustomTagDTO } from '@/model/tags/TagsDTO';
import { DeleteTagModal } from '@/components/tags/DeleteTagModal';


function TagsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // <- Nuevo estado
  const [selectedTag, setSelectedTag] = useState<CustomTag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<CustomTag | null>(null); // <- Nuevo estado

  const {
    tags,
    isLoadingTags,
    createTag,
    updateTag,
    deleteTag,
    isCreating,
    isUpdating,
    isDeleting
  } = useTagsQueries();

  // Filtrar tags
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || tag.studentTag === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleCreateTag = () => {
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  const handleEditTag = (tag: CustomTag) => {
    setSelectedTag(tag); // <- Cambiar a selectedTag
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTag(null);
    setTagToDelete(null);
  };

  const handleSubmit = (data: CreateCustomTagDTO) => {
    if (selectedTag) {
      updateTag({ id: selectedTag.id, data });
    } else {
      createTag(data);
    }
    handleCloseModal();
  };

  const handleDeleteTag = (tag : CustomTag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.id);
      setTagToDelete(null);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <NavbarLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full overflow-y-auto scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thin bg-gray-50"
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Tags</h1>
                <p className="text-gray-600 mt-1">Crea y administra los tags personalizados</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateTag}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nuevo Tag
              </motion.button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="LEAD">Lead</option>
                  <option value="ALUMNO">Alumno</option>
                  <option value="EX_ALUMNO">Ex Alumno</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tags Grid */}
          <AnimatePresence mode="wait">
            {isLoadingTags ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TagsSkeleton />
              </motion.div>
            ) : filteredTags.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  <Plus className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm || filterType !== 'all' ? 'No se encontraron tags' : 'No hay tags creados'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'Intenta cambiar los filtros de búsqueda'
                    : 'Comienza creando tu primer tag personalizado'
                  }
                </p>
                {(!searchTerm && filterType === 'all') && (
                  <button
                    onClick={handleCreateTag}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Crear primer tag
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="tags"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredTags.map((tag) => (
                    <TagCard
                      key={tag.id}
                      tag={tag}
                      onEdit={handleEditTag}
                      onDelete={handleDeleteTag}
                      isDeleting={isDeleting}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          {!isLoadingTags && tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
                  <div className="text-sm text-gray-600">Total Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tags.filter(t => t.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {tags.filter(t => t.important).length}
                  </div>
                  <div className="text-sm text-gray-600">Importantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredTags.length}
                  </div>
                  <div className="text-sm text-gray-600">Mostrados</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal */}
        <TagFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
          tag={selectedTag}
          title={selectedTag ? 'Editar Tag' : 'Crear Nuevo Tag'}
        />
        <DeleteTagModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          tag={tagToDelete}
          isDeleting={isDeleting}
        />
      </motion.div>
    </NavbarLayout>
  );
}

export default TagsPage;
