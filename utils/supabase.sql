-- Enable required extension for UUID if needed
create extension if not exists pgcrypto;

create table if not exists prompt_templates (
  slug text primary key,
  title text not null,
  description text not null,
  prompt_template text not null,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  author text not null,
  source_url text not null,
  style text,
  final_prompt text,
  variables jsonb not null default '[]'::jsonb,
  default_model text not null default 'gpt-image-2',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  user_id text not null,
  template_key text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, template_key)
);

create table if not exists user_credits (
  user_id text primary key,
  balance integer not null default 0,
  total_bought integer not null default 0,
  total_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id bigserial primary key,
  user_id text not null,
  delta integer not null,
  reason text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists processed_events (
  event_id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists purchase_orders (
  id bigserial primary key,
  user_id text not null,
  plan_key text not null,
  product_id text not null,
  credits integer not null,
  request_id text not null unique,
  checkout_id text,
  order_id text,
  customer_id text,
  status text not null,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_purchase_orders_checkout_id on purchase_orders (checkout_id);
create index if not exists idx_purchase_orders_request_id on purchase_orders (request_id);
create index if not exists idx_credit_transactions_user_id on credit_transactions (user_id);

-- Storage buckets must be created in Supabase dashboard (or SQL if your project supports):
-- prompt-template-images (public)
-- generated-images (public)
