-- Supabase SQL for project inquiries table
-- Run this in the Supabase SQL editor for the connected project.

-- Drop the table if it already exists (e.g. if created with incorrect columns via UI)
drop table if exists public.project_inquiries cascade;

create extension if not exists "pgcrypto";

create table public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  company_name text,
  email text not null,
  inquiry_type text not null,
  area_sqm numeric,
  message text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.project_inquiries enable row level security;

-- Create policies so that anyone can insert inquiries from the website,
-- and authenticated users (admins) can view them.
create policy "Enable insert access for everyone" on public.project_inquiries
  for insert with check (true);

create policy "Enable read access for authenticated users" on public.project_inquiries
  for select using (auth.role() = 'authenticated');

comment on table public.project_inquiries is 'Stores contact form project inquiries submitted through the frontend.';
comment on column public.project_inquiries.contact_name is 'Name of the contact submitting the inquiry.';
comment on column public.project_inquiries.company_name is 'Company name provided by the contact.';
comment on column public.project_inquiries.email is 'Contact email address.';
comment on column public.project_inquiries.inquiry_type is 'Type of inquiry selected by the contact.';
comment on column public.project_inquiries.area_sqm is 'Estimated project area in square meters.';
comment on column public.project_inquiries.message is 'Project details or message from the contact.';
comment on column public.project_inquiries.created_at is 'Timestamp when the inquiry was submitted.';

