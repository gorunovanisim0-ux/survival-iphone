import {
  BaseStageDef,
  GameSettings,
  SaveGameData,
  SkillTreeState,
  WeaponDef,
  WeaponId,
  WeaponProgress,
} from '../types/game';

export const MAP_SIZE = 1600;
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
    baseDamage: 28,
    fireIntervalMs: 340,
    bulletSpeed: 13,
    pellets: 1,
    spreadRad: 0.03,
    pierce: 1,
    range: 360,
    color: '#F59E0B',
  },
  {
    id: 'smg',
    name: 'ПП «Вектор-45»',
    category: 'Пистолет-пулемёт',
    description: 'Высокий темп стрельбы для сдерживания быстрых заражённых на подступах.',
    requiresWeaponId: 'pistol',
    craftCashCost: 120,
    craftScrapCost: 15,
    baseDamage: 21,
    fireIntervalMs: 135,
    bulletSpeed: 14,
    pellets: 1,
    spreadRad: 0.08,
    pierce: 1,
    range: 340,
    color: '#38BDF8',
  },
  {
    id: 'shotgun',
    name: 'Дробовик «Вепрь-12»',
    category: 'Дробовик',
    description: 'Выпускает плотный веер картечи, отбрасывающий толпу противников назад.',
    requiresWeaponId: 'smg',
    craftCashCost: 260,
    craftScrapCost: 35,
    baseDamage: 24,
    fireIntervalMs: 620,
    bulletSpeed: 12.5,
    pellets: 5,
    spreadRad: 0.28,
    pierce: 1,
    range: 270,
    color: '#EF4444',
  },
  {
    id: 'rifle',
    name: 'Карабин АК-105М',
    category: 'Штурмовая винтовка',
    description: 'Сбалансированная автоматическая винтовка с пробивными патронами.',
    requiresWeaponId: 'smg',
    craftCashCost: 340,
    craftScrapCost: 45,
    baseDamage: 46,
    fireIntervalMs: 185,
    bulletSpeed: 16,
    pellets: 1,
    spreadRad: 0.04,
    pierce: 2,
    range: 430,
    color: '#34D399',
  },
  {
    id: 'sniper',
    name: 'Винтовка СВД-Тактик',
    category: 'Снайперский комплекс',
    description: 'Сверхмощный калибр, прошивающий насквозь сразу нескольких бронированных целей.',
    requiresWeaponId: 'rifle',
    craftCashCost: 580,
    craftScrapCost: 80,
    baseDamage: 145,
    fireIntervalMs: 740,
    bulletSpeed: 21,
    pellets: 1,
    spreadRad: 0.01,
    pierce: 4,
    range: 540,
    color: '#818CF8',
  },
  {
    id: 'railgun',
    name: 'Рельсотрон «Арес-X»',
    category: 'Экспериментальное',
    description: 'Импульсный ускоритель с колоссальным уроном и сквозным пробитием любой волны.',
    requiresWeaponId: 'sniper',
    craftCashCost: 1100,
    craftScrapCost: 150,
    baseDamage: 240,
    fireIntervalMs: 460,
    bulletSpeed: 24,
    pellets: 1,
    spreadRad: 0.01,
    pierce: 6,
    range: 580,
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
    baseCost: 70,
    maxLevel: 15,
  },
  {
    key: 'armorLevel',
    title: 'Кевларовые пластины',
    subtitle: 'Снижает получаемый урон от укусов на 8%',
    baseCost: 85,
    maxLevel: 10,
  },
  {
    key: 'speedLevel',
    title: 'Тактическая мобильность',
    subtitle: '+8% к скорости бега и манёвренности',
    baseCost: 75,
    maxLevel: 10,
  },
  {
    key: 'critLevel',
    title: 'Калибровка прицела',
    subtitle: '+7% шанс нанести двойной критический урон',
    baseCost: 95,
    maxLevel: 10,
  },
  {
    key: 'scavengeLevel',
    title: 'Сбор трофеев',
    subtitle: '+15% больше монет и деталей с каждого врага',
    baseCost: 80,
    maxLevel: 10,
  },
  {
    key: 'regenLevel',
    title: 'Полевой медпакет',
    subtitle: 'Восстанавливает здоровье прямо во время боя',
    baseCost: 90,
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
    cashCost: 220,
    scrapCost: 25,
    safeRadius: 118,
    turretCount: 1,
    turretDamage: 38,
    turretFireMs: 650,
  },
  {
    stage: 2,
    title: 'Укреплённый форпост',
    subtitle: 'Бетонный контур + 2 авто-турели',
    description: 'Расширяет безопасную зону вокруг вышки и устанавливает две скорострельные турели по углам.',
    cashCost: 520,
    scrapCost: 65,
    safeRadius: 155,
    turretCount: 2,
    turretDamage: 54,
    turretFireMs: 480,
  },
  {
    stage: 3,
    title: 'Военная деревня',
    subtitle: 'Периметр с 4 турелями, казармой и арсеналом',
    description: 'Полноценная военная база с широким защитным рубежом, четырьмя тяжёлыми турелями и прожекторами.',
    cashCost: 980,
    scrapCost: 130,
    safeRadius: 195,
    turretCount: 4,
    turretDamage: 78,
    turretFireMs: 360,
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
  cash: 100,
  scrap: 12,
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
  const dmgMultiplier = 1 + (level - 1) * 0.22;
  const rateMultiplier = Math.max(0.55, 1 - (level - 1) * 0.05);
  return {
    ...def,
    damage: Math.round(def.baseDamage * dmgMultiplier),
    fireIntervalMs: Math.round(def.fireIntervalMs * rateMultiplier),
    upgradeCashCost: Math.round(80 + level * 65 + def.craftCashCost * 0.25),
    upgradeScrapCost: Math.round(10 + level * 8 + def.craftScrapCost * 0.2),
  };
}
