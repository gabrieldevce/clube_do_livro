# Como obter as chaves de API

O PlotTwist usa duas APIs externas. Você precisa criar contas e obter chaves (gratuitas).

---

## TMDB (The Movie Database) – filmes

1. Acesse **https://www.themoviedb.org/signup** e crie uma conta.
2. Vá em **Configurações** (ícone de avatar) → **Configurações** → **API**.
3. Solicite uma **API Key** (tipo “Developer”). Aceite os termos.
4. Copie a **API Key (v3 auth)**.
5. No `.env` do backend (ou nas variáveis de ambiente do Render), defina:
   ```env
   TMDB_API_KEY="sua_chave_aqui"
   ```

Documentação: https://developer.themoviedb.org/docs

---

## Google Books – livros

1. Acesse **https://console.cloud.google.com/** e entre com sua conta Google.
2. Crie um projeto (ou escolha um existente).
3. Vá em **APIs e serviços** → **Biblioteca** e busque por **Books API**. Ative a API.
4. Em **APIs e serviços** → **Credenciais** → **Criar credenciais** → **Chave de API**.
5. Copie a chave gerada.
6. No `.env` do backend (ou nas variáveis de ambiente do Render), defina:
   ```env
   GOOGLE_BOOKS_API_KEY="sua_chave_aqui"
   ```

Documentação: https://developers.google.com/books/docs/v1/getting_started

---

**Importante:** não suba essas chaves no Git. Use apenas em `.env` (local) ou nas variáveis de ambiente do serviço de deploy (ex.: Render).
