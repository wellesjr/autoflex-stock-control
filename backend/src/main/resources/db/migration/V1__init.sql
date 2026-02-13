create table products (
  id bigserial primary key,
  code varchar(50) not null unique,
  name varchar(200) not null,
  price numeric(19,4) not null
);

create table raw_materials (
  id bigserial primary key,
  code varchar(50) not null unique,
  name varchar(200) not null,
  stock_quantity numeric(19,4) not null
);

create table product_raw_materials (
  id bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  raw_material_id bigint not null references raw_materials(id) on delete restrict,
  required_quantity numeric(19,4) not null,
  constraint uq_product_material unique (product_id, raw_material_id)
);
