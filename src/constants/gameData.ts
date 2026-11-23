import {
  BaseStageDef,
  GameSettings,
  SaveGameData,
  SkillTreeState,
  WeaponDef,
  WeaponId,
  WeaponProgress,
} from '../types/game';

export const MAP_SIZE = 2800;
export const BASE_CENTER_X = MAP_SIZE / 2;
export const BASE_CENTER_Y = MAP_SIZE / 2;

export const COLORS = {
  bgDeep: '#0D1014',
  bgGround: '#12161C',
  bgGrid: 'rgba(255, 255, 255, 0.03)',
  baseFloor: '#181D26',
  baseBorder: '#2A3242',
  safeZoneStroke: 'rgba(56, 189, 248, 0.42)',
  safeZoneFill: 'rgba(56, 189, 248, 0.06)',
  glassBg: 'rgba(16, 19, 27, 0.90)',
  glassBorder: 'rgba(255, 255, 255, 0.09)',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#64748B',
  accentAmber: '#F59E0B',
  accentCyan: '#38BDF8',
  accentGreen: '#34D399',
  accentRed: '#EF4444',
  accentIndigo: '#818CF8',
  neonCyan: '#38BDF8',
  neonGold: '#F59E0B',
  neonPink: '#EF4444',
  neonPurple: '#818CF8',
  neonBlue: '#60A5FA',
  neonGreen: '#34D399',
};

export const WEAPON_DEFS: WeaponDef[] = [
  {
    id: 'pistol',
    name: 'Табельный ПМ-9',
    category: 'Пистолет',
    description: 'Надёжное базовое оружие для ближней дистанции. Не требует затрат на создание.',
    requiresWeaponId: null,
    craftCashCost: 0,
    craftScrapCost: 0,
    baseDamage: 25,
    fireIntervalMs: 360,
    bulletSpeed: 14,
    pellets: 1,
    spreadRad: 0.03,
    pierce: 1,
    range: 420,
    color: '#F59E0B',
  },
  {
    id: 'smg',
    name: 'ПП «Вектор-45»',
    category: 'Пистолет-пулемёт',
    description: 'Высокий темп стрельбы для сдерживания быстрых заражённых на подступах.',
    requiresWeaponId: 'pistol',
    craftCashCost: 340,
    craftScrapCost: 42,
    baseDamage: 20,
    fireIntervalMs: 140,
    bulletSpeed: 15,
    pellets: 1,
    spreadRad: 0.08,
    pierce: 1,
    range: 400,
    color: '#38BDF8',
  },
  {
    id: 'shotgun',
    name: 'Дробовик «Вепрь-12»',
    category: 'Дробовик',
    description: 'Выпускает плотный веер картечи, отбрасывающий толпу противников назад.',
    requiresWeaponId: 'smg',
    craftCashCost: 720,
    craftScrapCost: 90,
    baseDamage: 23,
    fireIntervalMs: 640,
    bulletSpeed: 13.5,
    pellets: 5,
    spreadRad: 0.28,
    pierce: 1,
    range: 330,
    color: '#EF4444',
  },
  {
    id: 'rifle',
    name: 'Карабин АК-105М',
    category: 'Штурмовая винтовка',
    description: 'Сбалансированная автоматическая винтовка с пробивными патронами.',
    requiresWeaponId: 'smg',
    craftCashCost: 980,
    craftScrapCost: 125,
    baseDamage: 44,
    fireIntervalMs: 190,
    bulletSpeed: 17,
    pellets: 1,
    spreadRad: 0.04,
    pierce: 2,
    range: 500,
    color: '#34D399',
  },
  {
    id: 'sniper',
    name: 'Винтовка СВД-Тактик',
    category: 'Снайперский комплекс',
    description: 'Сверхмощный калибр, прошивающий насквозь сразу нескольких бронированных целей.',
    requiresWeaponId: 'rifle',
    craftCashCost: 1750,
    craftScrapCost: 220,
    baseDamage: 140,
    fireIntervalMs: 760,
    bulletSpeed: 22,
    pellets: 1,
    spreadRad: 0.01,
    pierce: 4,
    range: 620,
    color: '#818CF8',
  },
  {
    id: 'railgun',
    name: 'Рельсотрон «Арес-X»',
    category: 'Экспериментальное',
    description: 'Импульсный ускоритель с колоссальным уроном и сквозным пробитием любой волны.',
    requiresWeaponId: 'sniper',
    craftCashCost: 3400,
    craftScrapCost: 420,
    baseDamage: 235,
    fireIntervalMs: 480,
    bulletSpeed: 25,
    pellets: 1,
    spreadRad: 0.01,
    pierce: 6,
    range: 660,
    color: '#38BDF8',
  },
];

export const SKILL_DEFS: {
  key: keyof SkillTreeState;
  title: string;
  subtitle: string;
  baseCost: number;
  maxLevel: number;
}[] = [
  {
    key: 'maxHpLevel',
    title: 'Боевая выносливость',
    subtitle: '+35 к максимальному запасу здоровья',
    baseCost: 165,
    maxLevel: 15,
  },
  {
    key: 'armorLevel',
    title: 'Кевларовые пластины',
    subtitle: 'Снижает получаемый урон от укусов на 7%',
    baseCost: 195,
    maxLevel: 10,
  },
  {
    key: 'speedLevel',
    title: 'Тактическая мобильность',
    subtitle: '+8% к скорости бега и манёвренности',
    baseCost: 180,
    maxLevel: 10,
  },
  {
    key: 'critLevel',
    title: 'Калибровка прицела',
    subtitle: '+7% шанс нанести двойной критический урон',
    baseCost: 230,
    maxLevel: 10,
  },
  {
    key: 'scavengeLevel',
    title: 'Сбор трофеев',
    subtitle: '+12% больше монет и деталей с каждого врага',
    baseCost: 190,
    maxLevel: 10,
  },
  {
    key: 'regenLevel',
    title: 'Полевой медпакет',
    subtitle: 'Восстанавливает здоровье прямо во время боя',
    baseCost: 215,
    maxLevel: 10,
  },
];

export const BASE_STAGES: BaseStageDef[] = [
  {
    stage: 0,
    title: 'Полевой полигон',
    subtitle: 'Стартовый рубеж',
    description: 'Открытая площадка с мишенями и верстаком для сборки оружия между волнами.',
    cashCost: 0,
    scrapCost: 0,
    safeRadius: 0,
    turretCount: 0,
    turretDamage: 0,
    turretFireMs: 1000,
  },
  {
    stage: 1,
    title: 'Сторожевая вышка',
    subtitle: 'Защитный периметр (зомби не подходят)',
    description: 'Возводит вышку со снайпером и барьерным полем: пока вы стоите у вышки, заражённые не могут подойти вплотную.',
    cashCost: 650,
    scrapCost: 75,
    safeRadius: 165,
    turretCount: 1,
    turretDamage: 36,
    turretFireMs: 680,
  },
  {
    stage: 2,
    title: 'Укреплённый форпост',
    subtitle: 'Бетонный контур + 2 авто-турели',
    description: 'Расширяет безопасную зону вокруг вышки и устанавливает две скорострельные турели по углам.',
    cashCost: 1550,
    scrapCost: 180,
    safeRadius: 225,
    turretCount: 2,
    turretDamage: 52,
    turretFireMs: 500,
  },
  {
    stage: 3,
    title: 'Военная деревня',
    subtitle: 'Периметр с 4 турелями, казармой и арсеналом',
    description: 'Полноценная военная база с широким защитным рубежом, четырьмя тяжёлыми турелями и прожекторами.',
    cashCost: 3100,
    scrapCost: 360,
    safeRadius: 285,
    turretCount: 4,
    turretDamage: 74,
    turretFireMs: 380,
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  hapticsEnabled: true,
  gyroEnabled: true,
  showDamageNumbers: true,
  joystickSensitivity: 1.0,
};

export const INITIAL_WEAPONS_STATE: Record<WeaponId, WeaponProgress> = {
  pistol: { unlocked: true, level: 1 },
  smg: { unlocked: false, level: 1 },
  shotgun: { unlocked: false, level: 1 },
  rifle: { unlocked: false, level: 1 },
  sniper: { unlocked: false, level: 1 },
  railgun: { unlocked: false, level: 1 },
};

export const INITIAL_SKILLS_STATE: SkillTreeState = {
  maxHpLevel: 1,
  speedLevel: 1,
  armorLevel: 0,
  critLevel: 0,
  scavengeLevel: 0,
  regenLevel: 0,
};

export const DEFAULT_SAVE_DATA: SaveGameData = {
  hasActiveSave: false,
  wave: 1,
  cash: 50,
  scrap: 6,
  totalKills: 0,
  equippedWeaponId: 'pistol',
  weapons: INITIAL_WEAPONS_STATE,
  skills: INITIAL_SKILLS_STATE,
  baseStage: 0,
  turretUpgradeLevel: 1,
  settings: DEFAULT_SETTINGS,
  savedAt: Date.now(),
};

export function getWeaponStats(weaponId: WeaponId, level: number) {
  const def = WEAPON_DEFS.find((w) => w.id === weaponId) || WEAPON_DEFS[0];
  const dmgMultiplier = 1 + (level - 1) * 0.2;
  const rateMultiplier = Math.max(0.58, 1 - (level - 1) * 0.045);
  return {
    ...def,
    damage: Math.round(def.baseDamage * dmgMultiplier),
    fireIntervalMs: Math.round(def.fireIntervalMs * rateMultiplier),
    upgradeCashCost: Math.round(190 + level * 155 + def.craftCashCost * 0.35),
    upgradeScrapCost: Math.round(25 + level * 20 + def.craftScrapCost * 0.25),
  };
}
