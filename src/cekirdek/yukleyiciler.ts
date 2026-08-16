/**
 * Oyun modülü yükleyicileri.
 *
 * `import.meta.glob` tembel çalışır: Vite her oyunu ayrı bir parçaya böler ve
 * yalnız açılan oyunun kodu indirilir. Elle liste tutulmaz — klasörü açtın mı
 * oyun buraya düşer.
 */

import type { OyunTanimi } from './tanim.ts'

const moduller = import.meta.glob('../games/**/oyun.ts') as Record<
  string,
  () => Promise<{ default: OyunTanimi }>
>

export function yukleyiciBul(id: string): (() => Promise<{ default: OyunTanimi }>) | null {
  const anahtar = Object.keys(moduller).find((yol) => yol.endsWith(`/${id}/oyun.ts`))
  return anahtar ? moduller[anahtar] : null
}

/** Sözleşme testi için: bulunan bütün oyun kimlikleri. */
export function tumKimlikler(): string[] {
  return Object.keys(moduller)
    .map((yol) => yol.match(/\/([^/]+)\/oyun\.ts$/)?.[1])
    .filter((id): id is string => Boolean(id))
    .sort()
}
