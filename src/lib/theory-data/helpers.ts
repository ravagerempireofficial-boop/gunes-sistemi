import type { TheoryCue, TheoryNote, SfxName } from "../theories";

/**
 * theory-data helpers — teori veri dosyaları için kısaltma üreticileri.
 * (Tip-only import kullanır: döngüsel bağımlılık oluşturmaz.)
 */
export const N = (
  t0: number,
  t1: number,
  text: string,
  x: number,
  y: number
): TheoryNote => ({ t0, t1, text, x, y });

export const C = (t: number, sfx: SfxName, power = 1): TheoryCue => ({
  t,
  sfx,
  power,
});
