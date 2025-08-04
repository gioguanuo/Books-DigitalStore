# 📚 Books Digital Store - Progetto Web

Un progetto web moderno con 5 pagine e API JSON consultabili, perfetto per dimostrare competenze di sviluppo frontend.

## 🌟 Demo Live
[Visualizza il sito live](https://tuonome.github.io/libreria-digitale)

## 📋 Caratteristiche

- ✅ **5 Pagine responsive**: Home, Libri, API, Statistiche, Contatti
- ✅ **API JSON simulate**: 8 endpoint consultabili direttamente dall'interfaccia
- ✅ **Design moderno**: Glassmorphism, animazioni fluide, gradiente attrattivo
- ✅ **Interattività**: Immagini cliccabili, modal, form funzionali
- ✅ **Mobile-first**: Completamente responsive
- ✅ **Vanilla JavaScript**: Nessuna dipendenza esterna

## 🚀 API Endpoints

| Endpoint | Descrizione |
|----------|-------------|
| `/api/books` | Lista completa dei libri |
| `/api/books/{id}` | Dettagli libro specifico |
| `/api/authors` | Lista autori |
| `/api/authors/{id}` | Dettagli autore specifico |
| `/api/categories` | Categorie disponibili |
| `/api/stats` | Statistiche generali |
| `/api/detailed-stats` | Statistiche dettagliate |
| `/api/contact-info` | Informazioni di contatto |

## 🛠️ Tecnologie Utilizzate

- **HTML5** - Struttura semantica
- **CSS3** - Styling avanzato con flexbox/grid
- **JavaScript ES6+** - Logica interattiva
- **JSON** - Dati strutturati per API simulate

## 📁 Struttura File

```
libreria-digitale/
│
├── index.html          # File principale
├── README.md           # Documentazione
├── assets/
│   ├── css/
│   │   └── style.css   # Stili separati (opzionale)
│   ├── js/
│   │   └── script.js   # JavaScript separato (opzionale)
│   └── data/
│       └── api.json    # Dati API (opzionale)
└── docs/
    └── screenshots/    # Screenshot per README
```

## 🚀 Come Usare

### Clona il repository:
```bash
git clone https://github.com/tuonome/libreria-digitale.git
cd libreria-digitale
```

### Apri localmente:
```bash
# Opzione 1: Apri direttamente index.html nel browser
open index.html

# Opzione 2: Usa un server locale (raccomandato)
python -m http.server 8000
# oppure
npx serve .
```

### Pubblica su GitHub Pages:
1. Vai nelle **Settings** del repository
2. Sezione **Pages** 
3. Source: **Deploy from a branch**
4. Branch: **main** / **master**
5. Folder: **/ (root)**
6. Save

## 🎯 Funzionalità Principali

### Navigazione
- **SPA (Single Page Application)** con routing JavaScript
- **Menu responsive** che si adatta ai dispositivi mobili
- **Indicatore pagina attiva** nella navigazione

### Pagina Libri
- **Griglia responsive** di card libro
- **Modal interattivi** con dettagli completi
- **Hover effects** per migliore UX

### API Explorer
- **Click-to-test** endpoint direttamente dall'interfaccia
- **JSON prettified** con syntax highlighting
- **Documentazione integrata** per ogni endpoint

### Dashboard Statistiche
- **Card animate** con metriche chiave
- **Dati real-time** dalle API simulate
- **Layout grid responsive**

## 🔧 Personalizzazione

### Modifica i colori del tema:
```css
:root {
  --primary-color: #764ba2;
  --secondary-color: #667eea;
  --accent-color: #f093fb;
}
```

### Aggiungi nuovi libri:
```javascript
// Nel file script.js, sezione apiData.books
{
  id: 7,
  title: "Il tuo libro",
  author: "Autore",
  year: 2024,
  category: "Categoria",
  pages: 300,
  isbn: "978-88-452-7777-7"
}
```

### Crea nuovi endpoint API:
```javascript
// Aggiungi in apiData
nuovoEndpoint: {
  // i tuoi dati
}

// Aggiungi case in loadApiData()
case 'nuovo-endpoint':
  data = apiData.nuovoEndpoint;
  apiUrl = '/api/nuovo-endpoint';
  break;
```

## 📱 Responsive Design

- **Desktop**: Layout a griglia completa
- **Tablet**: Griglia adattiva 2-3 colonne
- **Mobile**: Layout a colonna singola con menu compatto

## 🎨 Design System

### Colori
- **Primario**: `#764ba2` (Viola)
- **Secondario**: `#667eea` (Blu)
- **Gradiente**: Da blu a viola
- **Testo**: `#333` (Grigio scuro)
- **Background**: Gradiente + glassmorphism

### Tipografia
- **Font family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Weights**: 400 (normale), 500 (medium), 700 (bold)

### Spacing
- **Base unit**: 1rem (16px)
- **Piccolo**: 0.5rem
- **Medio**: 1rem
- **Grande**: 2rem
- **Extra grande**: 3rem

## 🤝 Contribuire

1. **Fork** il progetto
2. **Crea** un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Apri** una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT - vedi il file [LICENSE](LICENSE) per dettagli.

## 👨‍💻 Autore

**Il Tuo Nome**
- GitHub: [@tuonome](https://github.com/tuonome)
- LinkedIn: [Il Tuo Profilo](https://linkedin.com/in/tuoprofilo)
- Email: tua.email@example.com

## 🙏 Ringraziamenti

- Ispirazione dal design moderno di librerie digitali
- Icone emoji per un look friendly e accessibile
- Community open source per best practices

---

⭐ **Se questo progetto ti è stato utile, lascia una stella!** ⭐