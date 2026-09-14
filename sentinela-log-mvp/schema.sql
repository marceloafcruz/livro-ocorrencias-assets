CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin','gestor','seguranca')),
  unidade_id TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidades (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ocorrencias (
  id TEXT PRIMARY KEY,
  unidade_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa','media','alta','critica')),
  status TEXT NOT NULL CHECK (status IN ('aberta','em_atendimento','encerrada')),
  descricao TEXT NOT NULL,
  local TEXT,
  latitude REAL,
  longitude REAL,
  sync_status TEXT NOT NULL DEFAULT 'pendente',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT
);

CREATE TABLE auditoria (
  id TEXT PRIMARY KEY,
  usuario_id TEXT,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id TEXT NOT NULL,
  payload_json TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ocorrencias_unidade_status ON ocorrencias(unidade_id, status);
CREATE INDEX idx_auditoria_entidade ON auditoria(entidade, entidade_id);
