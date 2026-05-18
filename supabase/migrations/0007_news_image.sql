-- News item image support

-- 1. image_url column on news_items
alter table public.news_items add column if not exists image_url text;

-- 2. Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-images',
  'news-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. RLS policies
create policy "News images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'news-images');

create policy "Admins insert news images"
  on storage.objects for insert
  with check (
    bucket_id = 'news-images'
    and public.current_role_for(auth.uid()) = 'admin'
  );

create policy "Admins update news images"
  on storage.objects for update
  using (
    bucket_id = 'news-images'
    and public.current_role_for(auth.uid()) = 'admin'
  );

create policy "Admins delete news images"
  on storage.objects for delete
  using (
    bucket_id = 'news-images'
    and public.current_role_for(auth.uid()) = 'admin'
  );
