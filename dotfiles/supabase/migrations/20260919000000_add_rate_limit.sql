-- Rate limiting for /submit based on a hashed client IP.
-- A row only exists while the cooldown is still active: expired rows are
-- lazily deleted on read so the table never grows unbounded.

create table if not exists public.submission_attempts (
  ip_hash      text primary key,
  submitted_at timestamptz not null default now()
);

create or replace function public.record_submission_attempt(p_ip text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.submission_attempts (ip_hash, submitted_at)
  values (p_ip, now())
  on conflict (ip_hash) do update set submitted_at = now();
end;
$$;

create or replace function public.check_rate_limit(
  p_ip text,
  p_cooldown_minutes integer default 60
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  attempted timestamptz;
  remaining interval;
  retry_sec int;
begin
  delete from public.submission_attempts
  where ip_hash = p_ip
    and submitted_at < now() - make_interval(mins => p_cooldown_minutes);

  select submitted_at into attempted
  from public.submission_attempts
  where ip_hash = p_ip;

  if attempted is null then
    return json_build_object('allowed', true, 'retry_after_seconds', 0);
  end if;

  remaining := attempted + make_interval(mins => p_cooldown_minutes) - now();
  retry_sec := greatest(ceil(extract(epoch from remaining))::int, 1);

  return json_build_object('allowed', false, 'retry_after_seconds', retry_sec);
end;
$$;