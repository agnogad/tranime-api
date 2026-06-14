# 🎬 Tranime CMS

**Tranime** — anime içeriklerini JSON dosyaları üzerinden yönetmek için geliştirilmiş, modern ve profesyonel bir İçerik Yönetim Sistemidir (CMS). Tamamen yerel ortamda çalışır, veritabanı veya kimlik doğrulama gerektirmez.

> ✨ **Amaç:** Anime JSON dosyalarını elle düzenleme derdini ortadan kaldırmak. Tüm CRUD işlemlerini görsel bir arayüz üzerinden yapmak.

---

## 🚀 Özellikler

- **Anime Yönetimi** — Ekle, düzenle, sil, ara, filtrele, sırala
- **Bölüm Yönetimi** — Bölüm ekle/düzenle/sil, yeniden sırala
- **Kategori Yönetimi** — Kategori oluştur/düzenle/sil
- **Çoklu Yayın Sağlayıcıları** — Her bölüm için sınırsız yayın sağlayıcısı (StreamWish, FileMoon, VidHide, DoodStream, Fembed vb.)
- **Otomatik JSON Güncelleme** — Tüm değişiklikler anında JSON dosyalarına yazılır
- **Anime İndeksi** — `data/animes.json` otomatik olarak güncellenir
- **Pano (Dashboard)** — Toplam anime, bölüm, kategori istatistikleri
- **Görsel Arayüz** — Netflix + AniList esintili modern tasarım
- **Karanlık Tema** — Tamamen koyu tema, göz yormayan renk paleti
- **Duyarlı Tasarım** — Mobil ve masaüstü için optimize edilmiş
- **Bildirimler** — Toast bildirimleri ile anında geri bildirim
- **Onay Diyalogları** — Silme gibi kritik işlemlerde onay penceresi

---

## 🛠️ Teknolojiler

| Teknoloji | Açıklama |
|-----------|----------|
| **Next.js 15** | App Router ile React framework |
| **TypeScript** | Tip güvenliği |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **shadcn/ui** | Yeniden kullanılabilir UI komponentleri |
| **React Hook Form** | Form yönetimi |
| **Zod** | Şema doğrulama |
| **Zustand** | State yönetimi |
| **Lucide React** | İkon seti |
| **Sonner** | Toast bildirimleri |
| **Node.js fs/promises** | Dosya sistemi işlemleri |

---

## 📁 Dosya Yapısı

```
data/
├── animes.json              # Anime indeksi (frontend için)
├── categories.json          # Kategoriler
└── anime/
    ├── cyber-samurai/
    │   ├── info.json        # Anime detayları
    │   └── episodes.json    # Bölüm listesi
    └── neon-dream/
        ├── info.json
        └── episodes.json
```

**data/animes.json** — Frontend tarafından kullanılan ana indeks dosyasıdır. Tüm animeleri listeler, slug bilgisi sağlar, routing için kullanılır. Her anime eklendiğinde/düzenlendiğinde/silindiğinde otomatik olarak güncellenir.

---

## ⚡ Kurulum

```bash
# 1. Depoyu klonla
git clone https://github.com/agnogad/tranime-api.git
cd tranime-api

# 2. Bağımlılıkları yükle
npm install

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcında `http://localhost:3000` adresini aç. ✨

---

## 📸 Ekran Görüntüleri

| Pano | Anime Listesi |
|------|---------------|
| ![Dashboard](https://placehold.co/600x400/1a1a2e/e94560?text=Dashboard) | ![Anime List](https://placehold.co/600x400/1a1a2e/e94560?text=Anime+List) |

| Anime Detay | Bölüm Yönetimi |
|-------------|----------------|
| ![Detail](https://placehold.co/600x400/1a1a2e/e94560?text=Anime+Detail) | ![Episodes](https://placehold.co/600x400/1a1a2e/e94560?text=Episodes) |

---

## 🧩 Kullanım

### Anime Yönetimi

1. **Anime Ekle:** Sol menüden "Add Anime" → Formu doldur → "Create Anime"
2. **Anime Düzenle:** Anime kartındaki "Edit" butonu → Bilgileri güncelle → "Save Changes"
3. **Anime Sil:** Anime kartındaki çöp kutusu ikonu → Onayla
4. **Arama/Filtre:** Üst kısımdaki arama çubuğu ve filtreler ile anime bul

### Bölüm Yönetimi

1. Anime detay sayfasından "Manage Episodes" butonuna tıkla
2. "Add Episode" ile yeni bölüm ekle
3. Her bölüme sınırsız yayın sağlayıcısı ekle
4. Yukarı/aşağı oklarla bölümleri yeniden sırala

### Kategori Yönetimi

1. Sol menüden "Categories" sayfasına git
2. "Add Category" ile yeni kategori oluştur
3. Kategoriler anime formunda seçilebilir

---

## 📦 JSON Yapısı

### Anime (info.json)

```json
{
  "id": "cyber-samurai",
  "slug": "cyber-samurai",
  "title": "Cyber Samurai",
  "titleTr": "Siber Samuray",
  "description": "Gelecekte geçen epik bir hikaye...",
  "year": 2026,
  "status": "ongoing",
  "categories": ["action", "sci-fi"],
  "cover": "https://...",
  "banner": "https://...",
  "poster": "https://...",
  "rating": 8.5,
  "featured": true,
  "trending": false,
  "createdAt": "2026-06-14T12:00:00.000Z",
  "updatedAt": "2026-06-14T12:00:00.000Z"
}
```

### Bölüm (episodes.json)

```json
[
  {
    "episode": 1,
    "title": "Başlangıç",
    "description": "Yolculuk başlıyor...",
    "duration": "24:00",
    "releaseDate": "2026-06-14",
    "thumbnail": "https://...",
    "streams": [
      {
        "provider": "StreamWish",
        "embedUrl": "https://streamwish.com/embed/...",
        "quality": "1080p",
        "default": true
      },
      {
        "provider": "FileMoon",
        "embedUrl": "https://filemoon.com/embed/...",
        "quality": "720p",
        "default": false
      }
    ]
  }
]
```

---

## 🧑‍💻 API Rotaları

| Metot | Rota | Açıklama |
|-------|------|----------|
| `GET` | `/api/anime` | Tüm animeleri getir |
| `POST` | `/api/anime` | Yeni anime oluştur |
| `GET` | `/api/anime/[slug]` | Tek anime getir |
| `PUT` | `/api/anime/[slug]` | Anime güncelle |
| `DELETE` | `/api/anime/[slug]` | Anime sil |
| `GET` | `/api/categories` | Tüm kategorileri getir |
| `POST` | `/api/categories` | Kategori oluştur |
| `PUT` | `/api/categories/[slug]` | Kategori güncelle |
| `DELETE` | `/api/categories/[slug]` | Kategori sil |
| `GET` | `/api/episodes/[slug]` | Bölümleri getir |
| `POST` | `/api/episodes/[slug]` | Bölüm oluştur/yeniden sırala |
| `PUT` | `/api/episodes/[slug]/[episode]` | Bölüm güncelle |
| `DELETE` | `/api/episodes/[slug]/[episode]` | Bölüm sil |

---

## 📄 Lisans

MIT © [Agnogad](https://github.com/agnogad)
