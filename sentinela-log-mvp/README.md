# Sentinela Log MVP

Primeira versão funcional estática para testes na Hostinger.

## Como hospedar na Hostinger

1. Abra o Gerenciador de Arquivos da Hostinger.
2. Entre na pasta `public_html`.
3. Envie os arquivos desta pasta `sentinela-log-mvp`.
4. Acesse o domínio.

## Logins de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@sentinela.local | 123456 |
| Gestor | gestor@sentinela.local | 123456 |
| Segurança | seguranca@sentinela.local | 123456 |

## O que esta versão faz

- Login demonstrativo por perfil.
- Dashboard com indicadores.
- Registro de ocorrência.
- Captura de localização via navegador quando permitida.
- Persistência local no navegador usando localStorage.
- PWA básico com manifest e service worker.

## O que ainda não faz

- Backend real.
- SQLite no servidor.
- Upload real de foto.
- Sincronização multi-dispositivo.
- Autenticação segura em produção.

Esta versão serve para validar fluxo, telas e uso inicial antes do backend.
