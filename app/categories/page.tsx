'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/lib/types';
import { categorySchema, CategoryFormData } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { slugify } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  FolderTree,
  PlusCircle,
  Edit3,
  Trash2,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      slug: '',
      name: '',
    },
  });

  const watchName = watch('name');
  const watchSlug = watch('slug');

  // Auto-generate slug
  useEffect(() => {
    if (!editingCategory && watchName && !watchSlug) {
      setValue('slug', slugify(watchName));
    }
  }, [watchName, watchSlug, editingCategory, setValue]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCategory(null);
    reset({ slug: '', name: '' });
    setShowDialog(true);
  }

  function openEditDialog(cat: Category) {
    setEditingCategory(cat);
    reset({ slug: cat.slug, name: cat.name });
    setShowDialog(true);
  }

  async function onSubmit(data: CategoryFormData) {
    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update category');
        }

        toast.success('Category updated');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create category');
        }

        toast.success('Category created');
      }

      setShowDialog(false);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;

    try {
      const res = await fetch(`/api/categories/${deleteConfirm.slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete category');

      toast.success(`"${deleteConfirm.name}" deleted`);
      setDeleteConfirm(null);
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  }

  if (loading) return <LoadingState message="Loading categories..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground text-sm">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Category List */}
      {categories.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Create categories to organize your anime"
          icon={<FolderTree className="w-8 h-8" />}
          action={
            <Button onClick={openCreateDialog}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card
              key={cat.slug}
              className="border-border/50 hover:border-primary/30 transition-colors group"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderTree className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(cat)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(cat)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category details'
                : 'Add a new category for organizing anime'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                placeholder="Category name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                placeholder="category-slug"
                {...register('slug')}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              {!editingCategory && watchName && !watchSlug && (
                <p className="text-xs text-muted-foreground">
                  Auto-generated: {slugify(watchName)}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingCategory ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        onConfirm={handleDelete}
        confirmText="Delete Category"
        variant="destructive"
      />
    </div>
  );
}
