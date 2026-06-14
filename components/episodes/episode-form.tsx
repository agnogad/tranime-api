'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { episodeSchema, EpisodeFormData } from '@/lib/schemas';
import { PROVIDERS, QUALITIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImagePreview } from '@/components/shared/image-preview';
import { PlusCircle, Trash2, GripVertical, Globe, Film } from 'lucide-react';
import { toast } from 'sonner';

interface EpisodeFormProps {
  initialData?: EpisodeFormData;
  onSubmit: (data: EpisodeFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function EpisodeForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Episode',
}: EpisodeFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeSchema),
    defaultValues: initialData || {
      episode: 1,
      title: '',
      description: '',
      duration: '',
      releaseDate: '',
      thumbnail: '',
      streams: [
        {
          provider: 'StreamWish',
          embedUrl: '',
          quality: '1080p',
          default: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'streams',
  });

  const watchThumbnail = watch('thumbnail');
  const watchStreams = watch('streams');

  const handleFormSubmit = async (data: EpisodeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save episode');
    }
  };

  function addProvider() {
    append({
      provider: 'StreamWish',
      embedUrl: '',
      quality: '1080p',
      default: false,
    });
  }

  function setDefaultProvider(index: number) {
    const streams = watchStreams || [];
    streams.forEach((_, i) => {
      setValue(`streams.${i}.default`, i === index);
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Episode Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="episode">Episode Number *</Label>
              <Input
                id="episode"
                type="number"
                min="1"
                {...register('episode')}
              />
              {errors.episode && (
                <p className="text-sm text-destructive">
                  {errors.episode.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g. 24:00"
                {...register('duration')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-title">Title</Label>
            <Input
              id="episode-title"
              placeholder="Episode title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-description">Description</Label>
            <Textarea
              id="episode-description"
              placeholder="Episode description..."
              className="min-h-[80px]"
              {...register('description')}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="date"
                {...register('releaseDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                placeholder="https://example.com/thumb.jpg"
                {...register('thumbnail')}
              />
            </div>
          </div>

          <ImagePreview src={watchThumbnail} alt="Thumbnail preview" />
        </CardContent>
      </Card>

      {/* Streaming Providers */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Streaming Providers
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addProvider}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Film className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No streaming providers added yet.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={addProvider}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add First Provider
              </Button>
            </div>
          ) : (
            fields.map((field, index) => (
              <Card key={field.id} className="border-border/50 bg-muted/30">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <span className="text-sm font-medium">
                        Provider {index + 1}
                      </span>
                      {watchStreams?.[index]?.default && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Provider *</Label>
                      <Select
                        defaultValue={watchStreams?.[index]?.provider || 'StreamWish'}
                        onValueChange={(value) =>
                          setValue(`streams.${index}.provider`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select
                        defaultValue={watchStreams?.[index]?.quality || '1080p'}
                        onValueChange={(value) =>
                          setValue(`streams.${index}.quality`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALITIES.map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Embed URL *</Label>
                    <Input
                      placeholder="https://..."
                      {...register(`streams.${index}.embedUrl`)}
                    />
                    {errors.streams?.[index]?.embedUrl && (
                      <p className="text-sm text-destructive">
                        {errors.streams[index]?.embedUrl?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      id={`default-${index}`}
                      checked={watchStreams?.[index]?.default || false}
                      onCheckedChange={() => setDefaultProvider(index)}
                    />
                    <Label htmlFor={`default-${index}`}>Set as default provider</Label>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {errors.streams && (
            <p className="text-sm text-destructive">
              {errors.streams.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4 pb-8">
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
