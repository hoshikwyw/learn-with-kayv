-- Image uploads: course image column + Supabase Storage buckets for avatars and course images.

-- 1. courses.image_url
alter table public.courses add column if not exists image_url text;

-- 2. Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('course-images', 'course-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. RLS for avatars: anyone reads, users write only their own folder ({user_id}/...)
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users insert own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. RLS for course-images: anyone reads, admins only write
create policy "Course images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'course-images');

create policy "Admins insert course images"
  on storage.objects for insert
  with check (
    bucket_id = 'course-images'
    and public.current_role_for(auth.uid()) = 'admin'
  );

create policy "Admins update course images"
  on storage.objects for update
  using (
    bucket_id = 'course-images'
    and public.current_role_for(auth.uid()) = 'admin'
  );

create policy "Admins delete course images"
  on storage.objects for delete
  using (
    bucket_id = 'course-images'
    and public.current_role_for(auth.uid()) = 'admin'
  );
