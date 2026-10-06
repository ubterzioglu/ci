# Contributing — Çi Neo Cucina

## Front end dondurma kuralı

`src/components/**`, `src/app/globals.css` ve tüm sayfa/admin JSX markup'ı **dondurulmuştur**. Bu dosyalarda yalnızca JSX dışı mantık (state, handler, yardımcı fonksiyon) başka dosyaya taşınabilir; `className`, JSX öğesi veya prop değişmez. Admin bileşenlerinde de aynı kural geçerlidir.

## Doğrulama komutları

Değişiklik göndermeden önce yerel olarak şu komutları çalıştırın:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
```

Hepsi hatasız bitmeli. `format:check` hata verirse `pnpm format` çalıştırılıp diff incelenir.

## Commit biçimi

Her commit `<type>: <açıklama>` biçimindedir:

| Type       | Kullanım                                       |
| ---------- | ---------------------------------------------- |
| `feat`     | Yeni özellik                                   |
| `fix`      | Hata düzeltmesi                                |
| `refactor` | Davranış değişikliği olmayan yeniden düzenleme |
| `docs`     | Yalnızca dokümantasyon                         |
| `test`     | Test ekleme/düzeltme                           |
| `chore`    | Build, CI, bağımlılık                          |
| `perf`     | Performans iyileştirmesi                       |
| `ci`       | CI/CD değişikliği                              |

## Branch ve push

- `main`'e doğrudan commit yok; özellik/düzeltme dalı açılır.
- `git push` önce kullanıcı onayı bekler.

## Uydurma bilgi yok

Restorandan gelmesi gereken veri (adres, saatler, fiyat aralığı, ödeme yöntemleri vb.) doğrulanmadan koda veya schema'ya eklenmez. Eksik alan `null` kalır ve `docs/backlog/panel-exports-todo.md` dosyasına yazılır.
