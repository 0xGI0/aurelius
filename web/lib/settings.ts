import type { ThemePref } from '../theme/tokens';
export async function getThemePref(): Promise<ThemePref> { return 'system'; }
export async function setThemePref(_p: ThemePref): Promise<void> {}
