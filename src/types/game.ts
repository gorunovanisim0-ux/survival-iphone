export type WeaponId = 'pistol' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'railgun';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: string;
  description: string;
  requiresWeaponId: WeaponId | null;
  craftCashCost: number;
  craftScrapCost: number;
  baseDamage: number;
  fireIntervalMs: number;
  bulletSpeed: number;
  pellets: number;
  spreadRad: number;
  pierce: number;
  range: number;
  color: string;
}

export interface WeaponProgress {
  unlocked: boolean;
  level: number;
}

export interface SkillTreeState {
  maxHpLevel: number;
  speedLevel: number;
  armorLevel: number;
  critLevel: number;
  scavengeLevel: number;
  regenLevel: number;
}

export type BaseStageId = 0 | 1 | 2 | 3;

export interface BaseStageDef {
  stage: BaseStageId;
  title: string;
  subtitle: string;
  description: string;
  cashCost: number;
  scrapCost: number;
  safeRadius: number;
  turretCount: number;
  turretDamage: number;
  turretFireMs: number;
}

export type ZombieType = 'walker' | 'runner' | 'armored' | 'boss';

export interface ZombieEntity {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  damage: number;
  rewardCash: number;
  rewardScrap: number;
  walkPhase: number;
  hitFlash: number;
  attackCooldown: number;
}

export interface BulletEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  pierceLeft: number;
  life: number;
  color: string;
  fromTurret?: boolean;
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  cash: number;
  scrap: number;
  life: number;
}

export interface FloatingPopup {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export interface PracticeTarget {
  id: string;
  x: number;
  y: number;
  hitTimer: number;
}

export interface GameSettings {
  hapticsEnabled: boolean;
  gyroEnabled: boolean;
  showDamageNumbers: boolean;
  joystickSensitivity: number;
}

export interface SaveGameData {
  hasActiveSave: boolean;
  wave: number;
  cash: number;
  scrap: number;
  totalKills: number;
  equippedWeaponId: WeaponId;
  weapons: Record<WeaponId, WeaponProgress>;
  skills: SkillTreeState;
  baseStage: BaseStageId;
  turretUpgradeLevel: number;
  settings: GameSettings;
  savedAt: number;
}
