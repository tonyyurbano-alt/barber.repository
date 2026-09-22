# Barbearia Silva — site + agenda

## Arquivos
- `index.html`: site público
- `admin.html`: painel do barbeiro
- `styles.css`: visual
- `config.js`: configuração
- `app.js`: agenda pública
- `admin.js`: painel
- `supabase.sql`: banco + políticas

## 1. Criar o banco
1. Crie um projeto no Supabase.
2. Abra SQL Editor.
3. Cole o conteúdo de `supabase.sql` e execute.

## 2. Criar o usuário do barbeiro
No Supabase: Authentication > Users > Add user.
Crie o e-mail e a senha que serão usados no painel.

## 3. Configurar o site
Abra `config.js` e coloque:
SUPABASE_URL = URL do projeto
SUPABASE_ANON_KEY = chave anon public

Não coloque a service_role key no site.

## 4. Publicar no GitHub Pages
Envie os arquivos para o mesmo repositório:
index.html
admin.html
styles.css
config.js
app.js
admin.js

O `supabase.sql` e o README podem ficar no repositório, mas não são necessários para o site público.

## 5. Painel do barbeiro
Abra:
SEU-ENDERECO-GITHUB-PAGES/admin.html

Entre com o usuário criado no Supabase.
O barbeiro pode:
- ver a agenda por data
- confirmar com 1 clique
- cancelar
- abrir/fechar a agenda
- mudar o horário de fechamento
- falar com o cliente pelo WhatsApp

## Preços padrão deste projeto
Corte: R$35 — 35 min
Sobrancelha: R$15 — 15 min
Barba: R$25 — 20 min
Corte + Sobrancelha: R$45 — 35 min
Corte + Barba: R$55 — 45 min
Corte + Barba + Sobrancelha: R$70 — 40 min

Se os valores da barba/combos forem diferentes, altere no array `services` do `app.js`.
