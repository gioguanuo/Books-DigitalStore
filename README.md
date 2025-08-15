# 📚 Digital Library - Libreria Digitale

Una moderna libreria digitale con API REST e protezione Cloudflare Turnstile.

## 🚀 Features

- 📖 Catalogo libri interattivo
- 👥 Gestione autori
- 🔍 API REST complete
- 🛡️ Protezione anti-bot con Cloudflare Turnstile
- 📱 Design responsive
- ⚡ Deployed su Vercel

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Vercel Serverless Functions
- **Security**: Cloudflare Turnstile
- **Deployment**: Vercel

## 📋 API Endpoints

- `GET /api/books` - Lista tutti i libri
- `GET /api/books/[id]` - Dettagli libro specifico
- `GET /api/authors` - Lista tutti gli autori
- `GET /api/authors/[id]` - Dettagli autore specifico
- `GET /api/categories` - Categorie disponibili
- `GET /api/stats` - Statistiche generali
- `POST /api/turnstile-verify` - Verifica Turnstile

## 🔧 Setup

1. Clone del repository
2. Configura environment variables su Vercel:
   - `TURNSTILE_SECRET_KEY`
3. Deploy automatico su Vercel

## 🔗 Demo Live

[https://www.sectest-lab.space](https://www.sectest-lab.space)

## 📄 License

MIT License