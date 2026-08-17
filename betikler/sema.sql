-- Binbir Oyun — veritabanı şeması
-- Çalıştırmak için: Vercel → Storage → Postgres → Query, ya da psql "$POSTGRES_URL" -f betikler/sema.sql
-- Tekrar tekrar çalıştırılabilir (hepsi "if not exists").

create table if not exists oyuncular (
  uid              text primary key,
  ad               text,
  -- Sabit pencereli hız kısıtı sayacı (bkz. api/_sorgular.ts)
  pencere_basi     timestamptz not null default now(),
  pencere_sayaci   int not null default 0,
  olusturma        timestamptz not null default now()
);

-- Eski kurulumlar için: kolonlar yoksa ekle.
alter table oyuncular add column if not exists pencere_basi   timestamptz not null default now();
alter table oyuncular add column if not exists pencere_sayaci int not null default 0;

-- Yönetim paneli buraya yazacak; site bu tabloyu okumadan da tam çalışır.
create table if not exists oyunlar (
  id               text primary key,
  gizli            boolean not null default false,
  one_cikan        int,
  skor_ust_siniri  int not null default 200000,
  aciklama         text
);

-- Her oyuncunun her dönemde tek satırı olur; daha iyi skor eskisini günceller.
create table if not exists skorlar (
  oyun_id      text not null,
  uid          text not null,
  donem        text not null,
  ad           text not null,
  skor         int  not null check (skor > 0),
  sure_sn      int,
  dogrulandi   boolean not null default false,
  zaman        timestamptz not null default now(),
  primary key (oyun_id, uid, donem)
);

create index if not exists skorlar_tablo_idx on skorlar (oyun_id, donem, skor desc, zaman asc);
create index if not exists skorlar_uid_idx   on skorlar (uid, zaman desc);
