import { tanim } from '../../cekirdek/tanim.ts'

/**
 * Robicraft ayrı bir depoda geliştirilen voxel oyunu; kodu bu projeye
 * girmiyor. Katalogda kartı duruyor, kart doğrudan kendi adresine götürüyor.
 */
export default tanim({
  id: 'robicraft',
  ad: 'Robicraft',
  ozet: 'Küp küp kendi dünyanı kur, kaz ve inşa et.',
  aciklama: 'Voxel dünyasında kaz, küp yerleştir, istediğini inşa et.',
  ipucu: 'Oyun ayrı bir sekmede açılır.',
  emoji: '🧱',
  kategori: 'yerlestirme',
  etiketler: ['Voxel', 'İnşa', 'Serbest'],
  renk: ['#65a30d', '#14532d'],
  disAdres: 'https://robiminecraft-production.up.railway.app/',
})
