# Deploy do frontend na Vercel

A API do backend já está configurada para: **https://clube-do-livro-luwb.onrender.com**

## Opção 1: Deploy pelo site da Vercel (recomendado)

1. Acesse [vercel.com](https://vercel.com) e entre com GitHub/GitLab/Bitbucket.
2. **Add New** → **Project**.
3. Importe o repositório do projeto.
4. Configure:
   - **Root Directory:** clique em **Edit** e selecione a pasta **`frontend`**.
   - **Framework Preset:** Next.js (detectado automaticamente).
   - **Build Command:** `npm run build` (padrão).
   - **Environment Variables:** adicione (opcional, já há fallback no código):
     - Nome: `NEXT_PUBLIC_API_URL`  
     - Valor: `https://clube-do-livro-luwb.onrender.com`
5. Clique em **Deploy**.

Após o deploy, a URL do site aparecerá no painel (ex.: `https://seu-projeto.vercel.app`).

---

## Opção 2: Deploy pela linha de comando

Na pasta **frontend** do projeto:

```bash
cd frontend
npx vercel
```

Se for a primeira vez, faça login quando pedir (abre o navegador). Aceite as opções padrão. Para publicar em produção:

```bash
npx vercel --prod
```

A API já está definida como `https://clube-do-livro-luwb.onrender.com` no `next.config.mjs`; não é obrigatório definir `NEXT_PUBLIC_API_URL` na Vercel, mas você pode definir para deixar explícito.
