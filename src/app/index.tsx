import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Gyroscope } from 'expo-sensors';
import Svg, { Circle, Ellipse, G, Line, Rect } from 'react-native-svg';

import {
  BASE_CENTER_X,
  BASE_CENTER_Y,
  BASE_STAGES,
  COLORS,
  DEFAULT_SETTINGS,
  getWeaponStats,
  INITIAL_SKILLS_STATE,
  INITIAL_WEAPONS_STATE,
  MAP_SIZE,
  SKILL_DEFS,
  WEAPON_DEFS,
} from '../constants/gameData';
import {
  BaseStageId,
  BulletEntity,
  FloatingPopup,
  GameSettings,
  LootDrop,
  PracticeTarget,
  SaveGameData,
  SkillTreeState,
  WeaponId,
  WeaponProgress,
  ZombieEntity,
  ZombieType,
} from '../types/game';
import {
  BaseCompoundSvg,
  SurvivorSvg,
  ZombieSvg,
} from '../components/WorldEntitiesSvg';
import { WeaponIconSvg } from '../components/WeaponIconSvg';
import { CraftingAndSkillsModal } from '../components/CraftingAndSkillsModal';
import { PauseSettingsModal } from '../components/PauseSettingsModal';
import { ReviveModal } from '../components/ReviveModal';
import { MainMenuOverlay } from '../components/MainMenuOverlay';
import { loadSavedGame, persistSaveGame } from '../utils/storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAP_ART_SOURCE = require('../../assets/map-outpost.jpg');

// Courtyard Wall & Forest Collision Constants matching assets/map-outpost.jpg (1600x1600)
const WALL_INNER_R = 312;
const WALL_OUTER_R = 428;
const WALL_MID_R = (WALL_INNER_R + WALL_OUTER_R) / 2;
const GATE_HALF_WIDTH = 94;
const ROAD_HALF_WIDTH = 122;
const FOREST_RING_R = 515;

// Specific Tree, Rock & Prop Circular Colliders matching the painted map
const TREE_AND_ROCK_COLLIDERS: { x: number; y: number; r: number }[] = [
  // North-West Forest Quadrant Trees & Rocks
  { x: BASE_CENTER_X - 380, y: BASE_CENTER_Y - 375, r: 62 },
  { x: BASE_CENTER_X - 515, y: BASE_CENTER_Y - 235, r: 74 },
  { x: BASE_CENTER_X - 235, y: BASE_CENTER_Y - 515, r: 70 },
  { x: BASE_CENTER_X - 560, y: BASE_CENTER_Y - 520, r: 110 },
  { x: BASE_CENTER_X - 660, y: BASE_CENTER_Y - 340, r: 85 },
  { x: BASE_CENTER_X - 340, y: BASE_CENTER_Y - 660, r: 85 },

  // North-East Forest Quadrant Trees & Rocks
  { x: BASE_CENTER_X + 380, y: BASE_CENTER_Y - 375, r: 62 },
  { x: BASE_CENTER_X + 515, y: BASE_CENTER_Y - 235, r: 74 },
  { x: BASE_CENTER_X + 235, y: BASE_CENTER_Y - 515, r: 70 },
  { x: BASE_CENTER_X + 560, y: BASE_CENTER_Y - 520, r: 110 },
  { x: BASE_CENTER_X + 660, y: BASE_CENTER_Y - 340, r: 85 },
  { x: BASE_CENTER_X + 340, y: BASE_CENTER_Y - 660, r: 85 },

  // South-West Forest Quadrant Trees & Rocks
  { x: BASE_CENTER_X - 380, y: BASE_CENTER_Y + 375, r: 62 },
  { x: BASE_CENTER_X - 515, y: BASE_CENTER_Y + 235, r: 74 },
  { x: BASE_CENTER_X - 235, y: BASE_CENTER_Y + 515, r: 70 },
  { x: BASE_CENTER_X - 560, y: BASE_CENTER_Y + 520, r: 110 },
  { x: BASE_CENTER_X - 660, y: BASE_CENTER_Y + 340, r: 85 },
  { x: BASE_CENTER_X - 340, y: BASE_CENTER_Y + 660, r: 85 },

  // South-East Forest Quadrant Trees & Rocks
  { x: BASE_CENTER_X + 380, y: BASE_CENTER_Y + 375, r: 62 },
  { x: BASE_CENTER_X + 515, y: BASE_CENTER_Y + 235, r: 74 },
  { x: BASE_CENTER_X + 235, y: BASE_CENTER_Y + 515, r: 70 },
  { x: BASE_CENTER_X + 560, y: BASE_CENTER_Y + 520, r: 110 },
  { x: BASE_CENTER_X + 660, y: BASE_CENTER_Y + 340, r: 85 },
  { x: BASE_CENTER_X + 340, y: BASE_CENTER_Y + 660, r: 85 },
];

/**
 * Resolves physical collision against:
 * 1. The circular stone/sandbag walls around the Polygon courtyard (except the 4 open Gates).
 * 2. The Watchtower / Military Village buildings inside the courtyard.
 * 3. The outer forest tree line and individual trees/boulders.
 */
function resolveMapCollision(
  prevX: number,
  prevY: number,
  targetX: number,
  targetY: number,
  entityRadius: number,
  baseStage: BaseStageId
): { x: number; y: number } {
  let x = Math.max(55, Math.min(MAP_SIZE - 55, targetX));
  let y = Math.max(55, Math.min(MAP_SIZE - 55, targetY));

  const dx = x - BASE_CENTER_X;
  const dy = y - BASE_CENTER_Y;
  const dist = Math.hypot(dx, dy) || 0.001;

  const prevDx = prevX - BASE_CENTER_X;
  const prevDy = prevY - BASE_CENTER_Y;
  const prevDist = Math.hypot(prevDx, prevDy) || 0.001;

  // 1. Courtyard Circular Barricade Wall (Solid between WALL_INNER_R and WALL_OUTER_R unless inside one of the 4 Gates)
  const inNorthOrSouthGate = Math.abs(dx) < GATE_HALF_WIDTH - entityRadius * 0.4;
  const inEastOrWestGate = Math.abs(dy) < GATE_HALF_WIDTH - entityRadius * 0.4;
  const inAnyGate = inNorthOrSouthGate || inEastOrWestGate;

  const minWallR = WALL_INNER_R - entityRadius;
  const maxWallR = WALL_OUTER_R + entityRadius;

  if (!inAnyGate && dist > minWallR && dist < maxWallR) {
    // Check if we were previously inside a gate opening and hit the side pillar of the gate
    const wasInNSGate = Math.abs(prevDx) < GATE_HALF_WIDTH - entityRadius * 0.4;
    const wasInEWGate = Math.abs(prevDy) < GATE_HALF_WIDTH - entityRadius * 0.4;

    if (wasInNSGate) {
      const clampedDx =
        Math.sign(dx) * (GATE_HALF_WIDTH - entityRadius * 0.45);
      x = BASE_CENTER_X + clampedDx;
    } else if (wasInEWGate) {
      const clampedDy =
        Math.sign(dy) * (GATE_HALF_WIDTH - entityRadius * 0.45);
      y = BASE_CENTER_Y + clampedDy;
    } else if (prevDist <= WALL_MID_R) {
      // Push back inside courtyard along the curved inner wall
      const scale = minWallR / dist;
      x = BASE_CENTER_X + dx * scale;
      y = BASE_CENTER_Y + dy * scale;
    } else {
      // Push back outside courtyard along the curved outer wall
      const scale = maxWallR / dist;
      x = BASE_CENTER_X + dx * scale;
      y = BASE_CENTER_Y + dy * scale;
    }
  }

  // 2. Outer Forest Tree Line (Blocks walking deep into the 4 forest corners off-road)
  const currDx = x - BASE_CENTER_X;
  const currDy = y - BASE_CENTER_Y;
  const currDist = Math.hypot(currDx, currDy) || 0.001;
  const onCobblestoneRoad =
    Math.abs(currDx) < ROAD_HALF_WIDTH || Math.abs(currDy) < ROAD_HALF_WIDTH;

  if (!onCobblestoneRoad && currDist > FOREST_RING_R - entityRadius) {
    // If player was on a road and tried to step sideways into the deep forest, clamp to road edge
    if (Math.abs(prevDx) < ROAD_HALF_WIDTH) {
      x = BASE_CENTER_X + Math.sign(currDx) * (ROAD_HALF_WIDTH - 2);
    } else if (Math.abs(prevDy) < ROAD_HALF_WIDTH) {
      y = BASE_CENTER_Y + Math.sign(currDy) * (ROAD_HALF_WIDTH - 2);
    } else {
      const maxForestR = FOREST_RING_R - entityRadius;
      x = BASE_CENTER_X + (currDx / currDist) * maxForestR;
      y = BASE_CENTER_Y + (currDy / currDist) * maxForestR;
    }
  }

  // 3. Individual Trees & Boulders Circular Colliders
  for (const col of TREE_AND_ROCK_COLLIDERS) {
    const cdx = x - col.x;
    const cdy = y - col.y;
    const cDist = Math.hypot(cdx, cdy) || 0.001;
    const minDist = col.r + entityRadius;
    if (cDist < minDist) {
      x = col.x + (cdx / cDist) * minDist;
      y = col.y + (cdy / cDist) * minDist;
    }
  }

  // 4. Central Watchtower Physical Post & Military Village Buildings
  if (baseStage >= 1) {
    const tdx = x - BASE_CENTER_X;
    const tdy = y - BASE_CENTER_Y;
    const tDist = Math.hypot(tdx, tdy) || 0.001;
    const towerBaseR = 24 + entityRadius;
    if (tDist < towerBaseR) {
      x = BASE_CENTER_X + (tdx / tDist) * towerBaseR;
      y = BASE_CENTER_Y + (tdy / tDist) * towerBaseR;
    }
  }

  if (baseStage >= 3) {
    // Left Garrison & Right Armory solid building colliders
    const buildings = [
      { x: BASE_CENTER_X - 82, y: BASE_CENTER_Y, r: 30 },
      { x: BASE_CENTER_X + 82, y: BASE_CENTER_Y, r: 30 },
    ];
    for (const b of buildings) {
      const bdx = x - b.x;
      const bdy = y - b.y;
      const bDist = Math.hypot(bdx, bdy) || 0.001;
      const minB = b.r + entityRadius;
      if (bDist < minB) {
        x = b.x + (bdx / bDist) * minB;
        y = b.y + (bdy / bDist) * minB;
      }
    }
  }

  return { x, y };
}

function isBulletBlockedByWall(bx: number, by: number): boolean {
  const dx = bx - BASE_CENTER_X;
  const dy = by - BASE_CENTER_Y;
  const dist = Math.hypot(dx, dy);
  if (dist > WALL_INNER_R + 6 && dist < WALL_OUTER_R - 6) {
    const inGate =
      Math.abs(dx) < GATE_HALF_WIDTH || Math.abs(dy) < GATE_HALF_WIDTH;
    if (!inGate) return true;
  }
  return false;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createZombieForWave(wave: number, index: number): ZombieEntity {
  // Spawn zombies along the 4 cobblestone roads and outer lawn approaches
  const gateIndex = index % 4;
  let x = BASE_CENTER_X;
  let y = BASE_CENTER_Y;
  const roadDist = randomBetween(475, 720);
  const roadJitter = randomBetween(-75, 75);

  if (gateIndex === 0) {
    // North Road
    x = BASE_CENTER_X + roadJitter;
    y = BASE_CENTER_Y - roadDist;
  } else if (gateIndex === 1) {
    // South Road
    x = BASE_CENTER_X + roadJitter;
    y = BASE_CENTER_Y + roadDist;
  } else if (gateIndex === 2) {
    // West Road
    x = BASE_CENTER_X - roadDist;
    y = BASE_CENTER_Y + roadJitter;
  } else {
    // East Road
    x = BASE_CENTER_X + roadDist;
    y = BASE_CENTER_Y + roadJitter;
  }

  let type: ZombieType = 'walker';
  const roll = Math.random();
  const isBossSpawn = wave >= 3 && index === 0 && wave % 2 === 1;

  if (isBossSpawn) {
    type = 'boss';
  } else if (wave >= 4 && roll < 0.24) {
    type = 'armored';
  } else if (wave >= 2 && roll < 0.52) {
    type = 'runner';
  }

  const waveScale = 1 + (wave - 1) * 0.22;
  let hp = Math.round(52 * waveScale);
  let speed = 1.65 + Math.min(0.9, wave * 0.05);
  let radius = 16;
  let damage = Math.round(12 + wave * 2.2);
  let rewardCash = Math.round(14 + wave * 3);
  let rewardScrap = Math.random() < 0.55 ? 2 : 1;

  if (type === 'runner') {
    hp = Math.round(38 * waveScale);
    speed = 2.55 + Math.min(1.1, wave * 0.06);
    radius = 14;
    damage = Math.round(10 + wave * 2);
    rewardCash = Math.round(18 + wave * 3);
  } else if (type === 'armored') {
    hp = Math.round(115 * waveScale);
    speed = 1.3 + Math.min(0.6, wave * 0.04);
    radius = 18;
    damage = Math.round(18 + wave * 3);
    rewardCash = Math.round(30 + wave * 5);
    rewardScrap = 4;
  } else if (type === 'boss') {
    hp = Math.round(340 * waveScale);
    speed = 1.18 + Math.min(0.5, wave * 0.03);
    radius = 24;
    damage = Math.round(32 + wave * 5);
    rewardCash = Math.round(95 + wave * 18);
    rewardScrap = 12;
  }

  return {
    id: `z-${Date.now()}-${index}-${Math.random()}`,
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    hp,
    maxHp: hp,
    speed,
    radius,
    damage,
    rewardCash,
    rewardScrap,
    walkPhase: Math.random() * Math.PI * 2,
    hitFlash: 0,
    attackCooldown: 0,
  };
}

export default function TacticalSurvivalScreen() {
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [showWorkshopModal, setShowWorkshopModal] = useState<boolean>(false);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [showReviveModal, setShowReviveModal] = useState<boolean>(false);

  const [hasActiveSave, setHasActiveSave] = useState<boolean>(false);
  const [wave, setWave] = useState<number>(1);
  const [wavePhase, setWavePhase] = useState<'combat' | 'polygon'>('polygon');
  const [cash, setCash] = useState<number>(100);
  const [scrap, setScrap] = useState<number>(12);
  const [totalKills, setTotalKills] = useState<number>(0);
  const [equippedWeaponId, setEquippedWeaponId] = useState<WeaponId>('pistol');
  const [weapons, setWeapons] = useState<Record<WeaponId, WeaponProgress>>(
    INITIAL_WEAPONS_STATE
  );
  const [skills, setSkills] = useState<SkillTreeState>(INITIAL_SKILLS_STATE);
  const [baseStage, setBaseStage] = useState<BaseStageId>(0);
  const [turretUpgradeLevel, setTurretUpgradeLevel] = useState<number>(1);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const maxHp = useMemo(
    () => 100 + (skills.maxHpLevel - 1) * 35,
    [skills.maxHpLevel]
  );
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [zombiesRemainingToSpawn, setZombiesRemainingToSpawn] =
    useState<number>(0);

  const gyroRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const playerPosRef = useRef<{ x: number; y: number }>({
    x: BASE_CENTER_X,
    y: BASE_CENTER_Y + 42,
  });
  const playerAimDegRef = useRef<number>(0);
  const playerWalkPhaseRef = useRef<number>(0);
  const playerIsMovingRef = useRef<boolean>(false);
  const muzzleFlashTimerRef = useRef<number>(0);
  const lastPlayerShotTimeRef = useRef<number>(0);
  const lastTurretShotTimeRef = useRef<number>(0);
  const turretAimDegRef = useRef<number>(0);

  const zombiesRef = useRef<ZombieEntity[]>([]);
  const bulletsRef = useRef<BulletEntity[]>([]);
  const lootDropsRef = useRef<LootDrop[]>([]);
  const popupsRef = useRef<FloatingPopup[]>([]);
  const practiceTargetsRef = useRef<PracticeTarget[]>([
    { id: 't-1', x: BASE_CENTER_X - 75, y: BASE_CENTER_Y - 135, hitTimer: 0 },
    { id: 't-2', x: BASE_CENTER_X, y: BASE_CENTER_Y - 155, hitTimer: 0 },
    { id: 't-3', x: BASE_CENTER_X + 75, y: BASE_CENTER_Y - 135, hitTimer: 0 },
  ]);

  const joystickRef = useRef<{
    active: boolean;
    originX: number;
    originY: number;
    dx: number;
    dy: number;
  }>({
    active: false,
    originX: 0,
    originY: 0,
    dx: 0,
    dy: 0,
  });

  const [, setFrameTick] = useState<number>(0);

  const waveRef = useRef(wave);
  waveRef.current = wave;
  const wavePhaseRef = useRef(wavePhase);
  wavePhaseRef.current = wavePhase;
  const cashRef = useRef(cash);
  cashRef.current = cash;
  const scrapRef = useRef(scrap);
  scrapRef.current = scrap;
  const totalKillsRef = useRef(totalKills);
  totalKillsRef.current = totalKills;
  const equippedWeaponIdRef = useRef(equippedWeaponId);
  equippedWeaponIdRef.current = equippedWeaponId;
  const weaponsRef = useRef(weapons);
  weaponsRef.current = weapons;
  const skillsRef = useRef(skills);
  skillsRef.current = skills;
  const baseStageRef = useRef(baseStage);
  baseStageRef.current = baseStage;
  const turretUpgradeLevelRef = useRef(turretUpgradeLevel);
  turretUpgradeLevelRef.current = turretUpgradeLevel;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const playerHpRef = useRef(playerHp);
  playerHpRef.current = playerHp;
  const maxHpRef = useRef(maxHp);
  maxHpRef.current = maxHp;
  const toSpawnRef = useRef(zombiesRemainingToSpawn);
  toSpawnRef.current = zombiesRemainingToSpawn;

  const isPausedRef = useRef(false);
  isPausedRef.current =
    showMainMenu || showWorkshopModal || showPauseModal || showReviveModal;

  const saveCurrentProgress = useCallback(
    (overrideWave?: number, overrideCash?: number, overrideScrap?: number) => {
      const payload: SaveGameData = {
        hasActiveSave: true,
        wave: overrideWave ?? waveRef.current,
        cash: overrideCash ?? cashRef.current,
        scrap: overrideScrap ?? scrapRef.current,
        totalKills: totalKillsRef.current,
        equippedWeaponId: equippedWeaponIdRef.current,
        weapons: weaponsRef.current,
        skills: skillsRef.current,
        baseStage: baseStageRef.current,
        turretUpgradeLevel: turretUpgradeLevelRef.current,
        settings: settingsRef.current,
        savedAt: Date.now(),
      };
      setHasActiveSave(true);
      persistSaveGame(payload);
    },
    []
  );

  useEffect(() => {
    loadSavedGame().then((saved) => {
      if (saved) {
        setHasActiveSave(Boolean(saved.hasActiveSave));
        setWave(saved.wave || 1);
        setCash(saved.cash ?? 100);
        setScrap(saved.scrap ?? 12);
        setTotalKills(saved.totalKills ?? 0);
        setEquippedWeaponId(saved.equippedWeaponId || 'pistol');
        setWeapons(saved.weapons || INITIAL_WEAPONS_STATE);
        setSkills(saved.skills || INITIAL_SKILLS_STATE);
        setBaseStage(saved.baseStage ?? 0);
        setTurretUpgradeLevel(saved.turretUpgradeLevel ?? 1);
        setSettings(saved.settings || DEFAULT_SETTINGS);
        const restoredMaxHp = 100 + ((saved.skills?.maxHpLevel || 1) - 1) * 35;
        setPlayerHp(restoredMaxHp);
      }
    });
  }, []);

  useEffect(() => {
    Gyroscope.setUpdateInterval(60);
    const sub = Gyroscope.addListener((data) => {
      if (!settingsRef.current.gyroEnabled) {
        gyroRef.current = { x: 0, y: 0 };
        return;
      }
      gyroRef.current = {
        x: gyroRef.current.x * 0.8 + (data.x || 0) * 0.2,
        y: gyroRef.current.y * 0.8 + (data.y || 0) * 0.2,
      };
    });
    return () => sub.remove();
  }, []);

  const addPopup = useCallback(
    (text: string, color: string, x: number, y: number) => {
      popupsRef.current.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x,
        y,
        text,
        color,
        alpha: 1,
      });
    },
    []
  );

  const startCombatWave = useCallback(
    (targetWaveNumber: number) => {
      if (settingsRef.current.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      const totalCount = 6 + targetWaveNumber * 4;
      const initialBatch = Math.min(
        totalCount,
        5 + Math.floor(targetWaveNumber / 2)
      );
      const initialZombies: ZombieEntity[] = [];
      for (let i = 0; i < initialBatch; i++) {
        initialZombies.push(createZombieForWave(targetWaveNumber, i));
      }
      zombiesRef.current = initialZombies;
      setZombiesRemainingToSpawn(totalCount - initialBatch);
      setWave(targetWaveNumber);
      setWavePhase('combat');
      setPlayerHp(maxHpRef.current);
      addPopup(
        `ВОЛНА ${targetWaveNumber}`,
        COLORS.accentAmber,
        playerPosRef.current.x,
        playerPosRef.current.y - 40
      );
    },
    [addPopup]
  );

  useEffect(() => {
    let animId: number;
    let tick = 0;

    const step = () => {
      tick++;

      if (!isPausedRef.current) {
        const pPos = playerPosRef.current;
        const sk = skillsRef.current;
        const stg = settingsRef.current;
        const bStage = baseStageRef.current;
        const baseDef = BASE_STAGES[bStage] || BASE_STAGES[0];

        // 1. Player Movement with Wall & Forest Tree Collision
        const moveSpeed =
          (3.8 + (sk.speedLevel - 1) * 0.3) * stg.joystickSensitivity;
        if (joystickRef.current.active) {
          const vx = joystickRef.current.dx * moveSpeed;
          const vy = joystickRef.current.dy * moveSpeed;
          const nextPos = resolveMapCollision(
            pPos.x,
            pPos.y,
            pPos.x + vx,
            pPos.y + vy,
            16,
            bStage
          );
          pPos.x = nextPos.x;
          pPos.y = nextPos.y;
          playerIsMovingRef.current = Math.hypot(vx, vy) > 0.25;
          if (playerIsMovingRef.current) {
            playerWalkPhaseRef.current += 0.28;
          }
        } else {
          playerIsMovingRef.current = false;
        }

        if (sk.regenLevel > 0 && tick % 90 === 0) {
          setPlayerHp((hp) =>
            Math.min(maxHpRef.current, hp + sk.regenLevel * 2)
          );
        }

        if (
          wavePhaseRef.current === 'combat' &&
          toSpawnRef.current > 0 &&
          tick % 55 === 0 &&
          zombiesRef.current.length < 22
        ) {
          zombiesRef.current.push(
            createZombieForWave(waveRef.current, toSpawnRef.current)
          );
          setZombiesRemainingToSpawn((n) => Math.max(0, n - 1));
        }

        const wId = equippedWeaponIdRef.current;
        const wProg = weaponsRef.current[wId] || { unlocked: true, level: 1 };
        const wStats = getWeaponStats(wId, wProg.level);

        let nearestTarget: {
          x: number;
          y: number;
          dist: number;
          isZombie: boolean;
        } | null = null;

        for (const z of zombiesRef.current) {
          const d = Math.hypot(z.x - pPos.x, z.y - pPos.y);
          if (d <= wStats.range && (!nearestTarget || d < nearestTarget.dist)) {
            nearestTarget = { x: z.x, y: z.y, dist: d, isZombie: true };
          }
        }

        if (
          !nearestTarget &&
          wavePhaseRef.current === 'polygon' &&
          joystickRef.current.active
        ) {
          for (const pt of practiceTargetsRef.current) {
            const d = Math.hypot(pt.x - pPos.x, pt.y - pPos.y);
            if (
              d <= wStats.range * 0.85 &&
              (!nearestTarget || d < nearestTarget.dist)
            ) {
              nearestTarget = { x: pt.x, y: pt.y, dist: d, isZombie: false };
            }
          }
        }

        const now = Date.now();
        if (nearestTarget) {
          const aimRad = Math.atan2(
            nearestTarget.y - pPos.y,
            nearestTarget.x - pPos.x
          );
          playerAimDegRef.current = (aimRad * 180) / Math.PI;

          if (now - lastPlayerShotTimeRef.current >= wStats.fireIntervalMs) {
            lastPlayerShotTimeRef.current = now;
            muzzleFlashTimerRef.current = 4;

            if (stg.hapticsEnabled && nearestTarget.isZombie) {
              Haptics.selectionAsync().catch(() => {});
            }

            const critChance = sk.critLevel * 0.07;
            const isCrit = Math.random() < critChance;
            const shotDmg = isCrit ? wStats.damage * 2 : wStats.damage;

            for (let p = 0; p < wStats.pellets; p++) {
              const offsetAngle =
                wStats.pellets > 1
                  ? (p - (wStats.pellets - 1) / 2) *
                      (wStats.spreadRad / wStats.pellets) +
                    randomBetween(-0.04, 0.04)
                  : randomBetween(-wStats.spreadRad, wStats.spreadRad);
              const finalAngle = aimRad + offsetAngle;
              bulletsRef.current.push({
                id: `b-${now}-${p}-${Math.random()}`,
                x: pPos.x + Math.cos(aimRad) * 18,
                y: pPos.y + Math.sin(aimRad) * 18,
                vx: Math.cos(finalAngle) * wStats.bulletSpeed,
                vy: Math.sin(finalAngle) * wStats.bulletSpeed,
                damage: shotDmg,
                pierceLeft: wStats.pierce,
                life: Math.ceil(wStats.range / wStats.bulletSpeed),
                color: isCrit ? '#FEF08A' : wStats.color,
              });
            }
          }
        } else if (playerIsMovingRef.current) {
          playerAimDegRef.current =
            (Math.atan2(joystickRef.current.dy, joystickRef.current.dx) * 180) /
            Math.PI;
        }

        if (muzzleFlashTimerRef.current > 0) {
          muzzleFlashTimerRef.current--;
        }

        if (
          baseDef.turretCount > 0 &&
          zombiesRef.current.length > 0 &&
          now - lastTurretShotTimeRef.current >= baseDef.turretFireMs
        ) {
          let closestToBase: ZombieEntity | null = null;
          let minBaseDist = 480;
          for (const z of zombiesRef.current) {
            const d = Math.hypot(z.x - BASE_CENTER_X, z.y - BASE_CENTER_Y);
            if (d < minBaseDist) {
              minBaseDist = d;
              closestToBase = z;
            }
          }

          if (closestToBase) {
            lastTurretShotTimeRef.current = now;
            const tRad = Math.atan2(
              closestToBase.y - BASE_CENTER_Y,
              closestToBase.x - BASE_CENTER_X
            );
            turretAimDegRef.current = (tRad * 180) / Math.PI;
            const turretDmg = Math.round(
              baseDef.turretDamage *
                (1 + (turretUpgradeLevelRef.current - 1) * 0.25)
            );

            bulletsRef.current.push({
              id: `tb-${now}-${Math.random()}`,
              x: BASE_CENTER_X + Math.cos(tRad) * 20,
              y: BASE_CENTER_Y + Math.sin(tRad) * 20,
              vx: Math.cos(tRad) * 17,
              vy: Math.sin(tRad) * 17,
              damage: turretDmg,
              pierceLeft: 1,
              life: 32,
              color: COLORS.accentCyan,
              fromTurret: true,
            });
          }
        }

        const survivingBullets: BulletEntity[] = [];
        for (const b of bulletsRef.current) {
          b.x += b.vx;
          b.y += b.vy;
          b.life--;
          if (b.life <= 0) continue;

          // Non-turret bullets stop if they hit the solid stone walls of the courtyard
          if (!b.fromTurret && isBulletBlockedByWall(b.x, b.y)) {
            continue;
          }

          for (const pt of practiceTargetsRef.current) {
            if (Math.hypot(pt.x - b.x, pt.y - b.y) < 20) {
              pt.hitTimer = 8;
              b.pierceLeft = 0;
              if (stg.showDamageNumbers) {
                addPopup(`${b.damage}`, '#FEF08A', pt.x, pt.y - 20);
              }
              break;
            }
          }
          if (b.pierceLeft <= 0) continue;

          for (const z of zombiesRef.current) {
            if (z.hp <= 0) continue;
            if (Math.hypot(z.x - b.x, z.y - b.y) < z.radius + 5) {
              z.hp -= b.damage;
              z.hitFlash = 5;
              const kb = b.fromTurret ? 3.5 : 4.5;
              const bLen = Math.hypot(b.vx, b.vy) || 1;
              const pushed = resolveMapCollision(
                z.x,
                z.y,
                z.x + (b.vx / bLen) * kb,
                z.y + (b.vy / bLen) * kb,
                z.radius,
                bStage
              );
              z.x = pushed.x;
              z.y = pushed.y;

              if (stg.showDamageNumbers) {
                addPopup(
                  `${b.damage}`,
                  b.color === '#FEF08A' ? '#FEF08A' : '#FFFFFF',
                  z.x,
                  z.y - 18
                );
              }

              b.pierceLeft--;
              if (b.pierceLeft <= 0) break;
            }
          }

          if (b.pierceLeft > 0) {
            survivingBullets.push(b);
          }
        }
        bulletsRef.current = survivingBullets;

        for (const pt of practiceTargetsRef.current) {
          if (pt.hitTimer > 0) pt.hitTimer--;
        }

        // 5. Update Zombies with Gate Pathfinding & Wall/Watchtower Collisions
        const survivingZombies: ZombieEntity[] = [];
        const scavengeMult = 1 + sk.scavengeLevel * 0.15;
        const playerDistFromBase = Math.hypot(
          pPos.x - BASE_CENTER_X,
          pPos.y - BASE_CENTER_Y
        );
        const playerInsideCourtyard = playerDistFromBase < WALL_MID_R;

        const gates = [
          { x: BASE_CENTER_X, y: BASE_CENTER_Y - 365 },
          { x: BASE_CENTER_X, y: BASE_CENTER_Y + 365 },
          { x: BASE_CENTER_X - 365, y: BASE_CENTER_Y },
          { x: BASE_CENTER_X + 365, y: BASE_CENTER_Y },
        ];

        for (const z of zombiesRef.current) {
          if (z.hp <= 0) {
            const earnedCash = Math.round(z.rewardCash * scavengeMult);
            const earnedScrap = Math.round(z.rewardScrap * scavengeMult);

            lootDropsRef.current.push({
              id: `loot-${Date.now()}-${Math.random()}`,
              x: z.x,
              y: z.y,
              cash: earnedCash,
              scrap: earnedScrap,
              life: 700,
            });
            setTotalKills((k) => k + 1);
            continue;
          }

          if (z.hitFlash > 0) z.hitFlash--;
          if (z.attackCooldown > 0) z.attackCooldown--;
          z.walkPhase += 0.22;

          // Determine Zombie Steering Target (Guide through nearest Gate if separated by Courtyard Wall)
          const zDxFromBase = z.x - BASE_CENTER_X;
          const zDyFromBase = z.y - BASE_CENTER_Y;
          const zDistFromBase = Math.hypot(zDxFromBase, zDyFromBase);
          const zInsideCourtyard = zDistFromBase < WALL_MID_R;
          const zAlignedWithGate =
            Math.abs(zDxFromBase) < GATE_HALF_WIDTH - 12 ||
            Math.abs(zDyFromBase) < GATE_HALF_WIDTH - 12;

          let steerX = pPos.x;
          let steerY = pPos.y;

          if (playerInsideCourtyard !== zInsideCourtyard && !zAlignedWithGate) {
            // Find nearest gate archway to pass through the courtyard wall
            let bestGate = gates[0];
            let bestGateDist = 99999;
            for (const g of gates) {
              const gd = Math.hypot(z.x - g.x, z.y - g.y);
              if (gd < bestGateDist) {
                bestGateDist = gd;
                bestGate = g;
              }
            }
            steerX = bestGate.x;
            steerY = bestGate.y;
          }

          const dx = steerX - z.x;
          const dy = steerY - z.y;
          const distToTarget = Math.hypot(dx, dy) || 1;
          const rawNextX = z.x + (dx / distToTarget) * z.speed;
          const rawNextY = z.y + (dy / distToTarget) * z.speed;

          const resolvedZ = resolveMapCollision(
            z.x,
            z.y,
            rawNextX,
            rawNextY,
            z.radius,
            bStage
          );
          z.x = resolvedZ.x;
          z.y = resolvedZ.y;

          // Watchtower Safe Perimeter Barrier (Zombies cannot enter safeRadius!)
          if (baseDef.safeRadius > 0) {
            const distFromBase = Math.hypot(
              z.x - BASE_CENTER_X,
              z.y - BASE_CENTER_Y
            );
            const minAllowedDist = baseDef.safeRadius + z.radius;
            if (distFromBase < minAllowedDist) {
              const pushOutRad = Math.atan2(
                z.y - BASE_CENTER_Y,
                z.x - BASE_CENTER_X
              );
              z.x = BASE_CENTER_X + Math.cos(pushOutRad) * minAllowedDist;
              z.y = BASE_CENTER_Y + Math.sin(pushOutRad) * minAllowedDist;
            }
          }

          const newDistToPlayer = Math.hypot(pPos.x - z.x, pPos.y - z.y);
          if (newDistToPlayer < z.radius + 15 && z.attackCooldown <= 0) {
            z.attackCooldown = 42;
            const armorReduction = Math.min(0.75, sk.armorLevel * 0.08);
            const finalDmg = Math.max(
              2,
              Math.round(z.damage * (1 - armorReduction))
            );

            if (stg.hapticsEnabled) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              ).catch(() => {});
            }

            addPopup(`−${finalDmg} ОЗ`, COLORS.accentRed, pPos.x, pPos.y - 25);

            setPlayerHp((prevHp) => {
              const nextHp = prevHp - finalDmg;
              if (nextHp <= 0) {
                setShowReviveModal(true);
                return 0;
              }
              return nextHp;
            });
          }

          survivingZombies.push(z);
        }
        zombiesRef.current = survivingZombies;

        const pickupRadius = 78 + sk.scavengeLevel * 12;
        const remainingLoot: LootDrop[] = [];
        for (const l of lootDropsRef.current) {
          l.life--;
          if (l.life <= 0) continue;

          const dx = pPos.x - l.x;
          const dy = pPos.y - l.y;
          const d = Math.hypot(dx, dy);

          if (d < pickupRadius) {
            l.x += dx * 0.24;
            l.y += dy * 0.24;
          }

          if (d < 26) {
            setCash((c) => c + l.cash);
            setScrap((s) => s + l.scrap);
            if (stg.hapticsEnabled && tick % 2 === 0) {
              Haptics.selectionAsync().catch(() => {});
            }
          } else {
            remainingLoot.push(l);
          }
        }
        lootDropsRef.current = remainingLoot;

        if (
          wavePhaseRef.current === 'combat' &&
          toSpawnRef.current <= 0 &&
          zombiesRef.current.length === 0
        ) {
          let bonusCash = 35 + waveRef.current * 15;
          let bonusScrap = 5 + waveRef.current * 2;
          for (const l of lootDropsRef.current) {
            bonusCash += l.cash;
            bonusScrap += l.scrap;
          }
          lootDropsRef.current = [];

          const nextCash = cashRef.current + bonusCash;
          const nextScrap = scrapRef.current + bonusScrap;
          const completedWave = waveRef.current;

          setCash(nextCash);
          setScrap(nextScrap);
          setPlayerHp(maxHpRef.current);
          setWavePhase('polygon');

          if (stg.hapticsEnabled) {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            ).catch(() => {});
          }

          addPopup(
            `ВОЛНА ${completedWave} ОТБИТА (+${bonusCash} МОН.)`,
            COLORS.accentGreen,
            pPos.x,
            pPos.y - 36
          );

          saveCurrentProgress(completedWave + 1, nextCash, nextScrap);
          setWave(completedWave + 1);
        }

        popupsRef.current = popupsRef.current
          .map((p) => ({ ...p, y: p.y - 0.9, alpha: p.alpha - 0.025 }))
          .filter((p) => p.alpha > 0);
      }

      setFrameTick((t) => (t + 1) % 1000000);
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [addPopup, saveCurrentProgress]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        joystickRef.current = {
          active: true,
          originX: pageX,
          originY: pageY,
          dx: 0,
          dy: 0,
        };
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const j = joystickRef.current;
        const rawDx = pageX - j.originX;
        const rawDy = pageY - j.originY;
        const dist = Math.hypot(rawDx, rawDy);
        const maxDist = 52;
        if (dist > 3) {
          const factor = Math.min(dist, maxDist) / maxDist;
          j.dx = (rawDx / dist) * factor;
          j.dy = (rawDy / dist) * factor;
        } else {
          j.dx = 0;
          j.dy = 0;
        }
      },
      onPanResponderRelease: () => {
        joystickRef.current.active = false;
        joystickRef.current.dx = 0;
        joystickRef.current.dy = 0;
      },
      onPanResponderTerminate: () => {
        joystickRef.current.active = false;
        joystickRef.current.dx = 0;
        joystickRef.current.dy = 0;
      },
    })
  ).current;

  const handleCraftOrEquipWeapon = (weaponId: WeaponId) => {
    const prog = weapons[weaponId];
    const def = WEAPON_DEFS.find((w) => w.id === weaponId);
    if (!def) return;

    if (prog?.unlocked) {
      setEquippedWeaponId(weaponId);
      if (settings.hapticsEnabled) {
        Haptics.selectionAsync().catch(() => {});
      }
      return;
    }

    if (cash >= def.craftCashCost && scrap >= def.craftScrapCost) {
      const nextCash = cash - def.craftCashCost;
      const nextScrap = scrap - def.craftScrapCost;
      const nextWeapons = {
        ...weapons,
        [weaponId]: { unlocked: true, level: 1 },
      };
      setCash(nextCash);
      setScrap(nextScrap);
      setWeapons(nextWeapons);
      setEquippedWeaponId(weaponId);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
      setTimeout(() => saveCurrentProgress(wave, nextCash, nextScrap), 50);
    }
  };

  const handleUpgradeWeapon = (weaponId: WeaponId) => {
    const prog = weapons[weaponId];
    if (!prog?.unlocked) return;
    const st = getWeaponStats(weaponId, prog.level);
    if (cash >= st.upgradeCashCost && scrap >= st.upgradeScrapCost) {
      const nextCash = cash - st.upgradeCashCost;
      const nextScrap = scrap - st.upgradeScrapCost;
      setCash(nextCash);
      setScrap(nextScrap);
      setWeapons((prev) => ({
        ...prev,
        [weaponId]: { unlocked: true, level: prev[weaponId].level + 1 },
      }));
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
      setTimeout(() => saveCurrentProgress(wave, nextCash, nextScrap), 50);
    }
  };

  const handleUpgradeSkill = (skillKey: keyof SkillTreeState) => {
    const def = SKILL_DEFS.find((s) => s.key === skillKey);
    if (!def) return;
    const currLvl = skills[skillKey] || 0;
    if (currLvl >= def.maxLevel) return;
    const cost = Math.round(def.baseCost * Math.pow(1.38, currLvl));
    if (cash >= cost) {
      const nextCash = cash - cost;
      setCash(nextCash);
      setSkills((prev) => ({
        ...prev,
        [skillKey]: prev[skillKey] + 1,
      }));
      if (skillKey === 'maxHpLevel') {
        setPlayerHp((hp) => hp + 35);
      }
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      setTimeout(() => saveCurrentProgress(wave, nextCash, scrap), 50);
    }
  };

  const handleUpgradeBaseStage = () => {
    if (baseStage >= 3) return;
    const nextStage = (baseStage + 1) as BaseStageId;
    const nextDef = BASE_STAGES[nextStage];
    if (cash >= nextDef.cashCost && scrap >= nextDef.scrapCost) {
      const nextCash = cash - nextDef.cashCost;
      const nextScrap = scrap - nextDef.scrapCost;
      setCash(nextCash);
      setScrap(nextScrap);
      setBaseStage(nextStage);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
      addPopup(
        `ПОСТРОЕНО: ${nextDef.title.toUpperCase()}`,
        COLORS.accentCyan,
        BASE_CENTER_X,
        BASE_CENTER_Y - 50
      );
      setTimeout(() => saveCurrentProgress(wave, nextCash, nextScrap), 50);
    }
  };

  const handleUpgradeTurrets = () => {
    const costCash = 140 + turretUpgradeLevel * 95;
    const costScrap = 18 + turretUpgradeLevel * 12;
    if (cash >= costCash && scrap >= costScrap) {
      const nextCash = cash - costCash;
      const nextScrap = scrap - costScrap;
      setCash(nextCash);
      setScrap(nextScrap);
      setTurretUpgradeLevel((l) => l + 1);
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      setTimeout(() => saveCurrentProgress(wave, nextCash, nextScrap), 50);
    }
  };

  const handleRevive = (cost: number, targetWave: number) => {
    const nextCash = Math.max(0, cash - cost);
    setCash(nextCash);
    setWave(targetWave);
    setWavePhase('polygon');
    zombiesRef.current = [];
    bulletsRef.current = [];
    setZombiesRemainingToSpawn(0);
    playerPosRef.current = { x: BASE_CENTER_X, y: BASE_CENTER_Y + 42 };
    setPlayerHp(maxHp);
    setShowReviveModal(false);
    saveCurrentProgress(targetWave, nextCash, scrap);
  };

  const handleNewGame = () => {
    setWave(1);
    setWavePhase('polygon');
    setCash(100);
    setScrap(12);
    setTotalKills(0);
    setEquippedWeaponId('pistol');
    setWeapons(INITIAL_WEAPONS_STATE);
    setSkills(INITIAL_SKILLS_STATE);
    setBaseStage(0);
    setTurretUpgradeLevel(1);
    setPlayerHp(100);
    zombiesRef.current = [];
    bulletsRef.current = [];
    lootDropsRef.current = [];
    playerPosRef.current = { x: BASE_CENTER_X, y: BASE_CENTER_Y + 42 };
    setShowMainMenu(false);
    setTimeout(() => saveCurrentProgress(1, 100, 12), 50);
  };

  // Clamp Camera strictly within the 1600x1600 painted map illustration!
  const gyroOffsetX = settings.gyroEnabled
    ? Math.max(-12, Math.min(12, gyroRef.current.y * 9))
    : 0;
  const gyroOffsetY = settings.gyroEnabled
    ? Math.max(-12, Math.min(12, gyroRef.current.x * 9))
    : 0;

  const rawCamX = playerPosRef.current.x - SCREEN_W / 2 + gyroOffsetX;
  const rawCamY = playerPosRef.current.y - SCREEN_H / 2 + gyroOffsetY;
  const camX = Math.max(0, Math.min(Math.max(0, MAP_SIZE - SCREEN_W), rawCamX));
  const camY = Math.max(0, Math.min(Math.max(0, MAP_SIZE - SCREEN_H), rawCamY));

  const currentBaseDef = BASE_STAGES[baseStage] || BASE_STAGES[0];
  const distFromBaseCenter = Math.hypot(
    playerPosRef.current.x - BASE_CENTER_X,
    playerPosRef.current.y - BASE_CENTER_Y
  );
  const playerInSafeZone =
    currentBaseDef.safeRadius > 0 &&
    distFromBaseCenter <= currentBaseDef.safeRadius;
  const playerNearPolygon = distFromBaseCenter <= 240;

  const currentWeaponDef =
    WEAPON_DEFS.find((w) => w.id === equippedWeaponId) || WEAPON_DEFS[0];
  const currentWeaponLevel = weapons[equippedWeaponId]?.level || 1;
  const hpPct = Math.max(
    0,
    Math.min(100, Math.round((playerHp / maxHp) * 100))
  );

  return (
    <View style={styles.root}>
      {/* Full-Map Hand-Painted 2.5D Survival Outpost World (Covers 100% of MAP_SIZE) */}
      <View style={styles.arenaContainer} {...panResponder.panHandlers}>
        <Image
          source={MAP_ART_SOURCE}
          resizeMode="cover"
          style={[
            styles.mapArtImage,
            {
              left: -camX,
              top: -camY,
            },
          ]}
        />

        {/* Central Watchtower, Military Village Buildings, Auto-Turrets & Safe Dome Overlay */}
        <View
          pointerEvents="none"
          style={[
            styles.baseCompoundWrapper,
            {
              left: BASE_CENTER_X - camX - 260,
              top: BASE_CENTER_Y - camY - 260,
            },
          ]}
        >
          <BaseCompoundSvg
            baseStage={baseStage}
            turretAngleDeg={turretAimDegRef.current}
            playerInSafeZone={playerInSafeZone}
          />
        </View>

        {/* Standing Dummy Targets, Loot Drops & Bullets Layer */}
        <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
          {/* 2.5D Standing Humanoid Practice Dummy Targets on the Stone Polygon */}
          {practiceTargetsRef.current.map((pt) => {
            const sx = pt.x - camX;
            const sy = pt.y - camY;
            const isHit = pt.hitTimer > 0;
            return (
              <G key={pt.id}>
                <Ellipse
                  cx={sx}
                  cy={sy + 14}
                  rx={12}
                  ry={4.5}
                  fill="rgba(0,0,0,0.48)"
                />
                <Line
                  x1={sx}
                  y1={sy + 4}
                  x2={sx}
                  y2={sy + 14}
                  stroke="#78350F"
                  strokeWidth={3.5}
                />
                <Rect
                  x={sx - 9}
                  y={sy - 11}
                  width={18}
                  height={16}
                  rx={3.5}
                  fill={isHit ? '#FEF08A' : '#B45309'}
                  stroke="#111827"
                  strokeWidth={1.8}
                />
                <Circle
                  cx={sx}
                  cy={sy - 16.5}
                  r={5.5}
                  fill={isHit ? '#FEF08A' : '#D97706'}
                  stroke="#111827"
                  strokeWidth={1.8}
                />
                <Circle
                  cx={sx}
                  cy={sy - 3}
                  r={4.8}
                  fill="#FFFFFF"
                  stroke="#DC2626"
                  strokeWidth={1.8}
                />
                <Circle cx={sx} cy={sy - 3} r={2} fill="#DC2626" />
              </G>
            );
          })}

          {/* Dropped Loot (Gold Coins & Blue Weapon Parts Cases) */}
          {lootDropsRef.current.map((l) => {
            const sx = l.x - camX;
            const sy = l.y - camY;
            if (
              sx < -30 ||
              sx > SCREEN_W + 30 ||
              sy < -30 ||
              sy > SCREEN_H + 30
            )
              return null;
            return (
              <G key={l.id}>
                <Circle
                  cx={sx - 4}
                  cy={sy}
                  r={5}
                  fill="#F59E0B"
                  stroke="#111827"
                  strokeWidth={1.4}
                />
                <Rect
                  x={sx + 2}
                  y={sy - 4}
                  width={8.5}
                  height={7.5}
                  rx={2}
                  fill="#38BDF8"
                  stroke="#111827"
                  strokeWidth={1.4}
                />
              </G>
            );
          })}

          {/* Bullets & Tracers */}
          {bulletsRef.current.map((b) => {
            const sx = b.x - camX;
            const sy = b.y - camY;
            return (
              <Line
                key={b.id}
                x1={sx}
                y1={sy}
                x2={sx - b.vx * 0.95}
                y2={sy - b.vy * 0.95}
                stroke={b.color}
                strokeWidth={3.2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Floating Joystick */}
          {joystickRef.current.active && (
            <>
              <Circle
                cx={joystickRef.current.originX}
                cy={joystickRef.current.originY}
                r={44}
                fill="rgba(255, 255, 255, 0.06)"
                stroke="rgba(255, 255, 255, 0.24)"
                strokeWidth={1.5}
              />
              <Circle
                cx={joystickRef.current.originX + joystickRef.current.dx * 38}
                cy={joystickRef.current.originY + joystickRef.current.dy * 38}
                r={15}
                fill="rgba(255, 255, 255, 0.48)"
              />
            </>
          )}
        </Svg>

        {/* Render 2.5D Animated Zombies */}
        {zombiesRef.current.map((z) => {
          const sx = z.x - camX;
          const sy = z.y - camY;
          if (sx < -80 || sx > SCREEN_W + 80 || sy < -80 || sy > SCREEN_H + 80) {
            return null;
          }
          const angleToPlayer =
            (Math.atan2(
              playerPosRef.current.y - z.y,
              playerPosRef.current.x - z.x
            ) *
              180) /
            Math.PI;
          const zPct = Math.max(0, Math.min(100, (z.hp / z.maxHp) * 100));
          const boxOffset = z.type === 'boss' ? 48 : 34;

          return (
            <View
              key={z.id}
              pointerEvents="none"
              style={[
                styles.entityBox,
                { left: sx - boxOffset, top: sy - boxOffset },
              ]}
            >
              {z.hp < z.maxHp && (
                <View style={styles.zombieHpBg}>
                  <View
                    style={[styles.zombieHpFill, { width: `${zPct}%` }]}
                  />
                </View>
              )}
              <ZombieSvg
                type={z.type}
                angleDeg={angleToPlayer}
                walkPhase={z.walkPhase}
                hitFlash={z.hitFlash > 0}
              />
            </View>
          );
        })}

        {/* Render 2.5D Animated Human Survivor */}
        <View
          pointerEvents="none"
          style={[
            styles.entityBox,
            {
              left: playerPosRef.current.x - camX - 43,
              top: playerPosRef.current.y - camY - 43,
            },
          ]}
        >
          <SurvivorSvg
            aimAngleDeg={playerAimDegRef.current}
            walkPhase={playerWalkPhaseRef.current}
            isMoving={playerIsMovingRef.current}
            isFiring={muzzleFlashTimerRef.current > 0}
            weaponId={equippedWeaponId}
            armorLevel={skills.armorLevel}
          />
          {playerInSafeZone && (
            <View style={styles.safeShieldTag}>
              <Text style={styles.safeShieldText}>Под защитой вышки</Text>
            </View>
          )}
        </View>

        {/* Floating Damage & Reward Popups */}
        {popupsRef.current.map((p) => {
          const sx = p.x - camX;
          const sy = p.y - camY;
          return (
            <View
              key={p.id}
              pointerEvents="none"
              style={[
                styles.popupBox,
                { left: sx - 80, top: sy, opacity: p.alpha },
              ]}
            >
              <Text style={[styles.popupText, { color: p.color }]}>
                {p.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* TACTICAL HUD */}
      <SafeAreaView pointerEvents="box-none" style={styles.hudSafe}>
        <View pointerEvents="box-none" style={styles.topRow}>
          <View style={styles.statusCard}>
            <View style={styles.hpHeaderRow}>
              <Text style={styles.hpLabel}>ЗДОРОВЬЕ БОЙЦА</Text>
              <Text style={styles.hpVal}>
                {playerHp} / {maxHp}
              </Text>
            </View>
            <View style={styles.hpBarBg}>
              <View
                style={[
                  styles.hpBarFill,
                  {
                    width: `${hpPct}%`,
                    backgroundColor:
                      hpPct > 35 ? COLORS.accentGreen : COLORS.accentRed,
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowWorkshopModal(true)}
              style={styles.hudWeaponSlot}
            >
              <WeaponIconSvg
                weaponId={equippedWeaponId}
                width={52}
                height={24}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.weaponNameText} numberOfLines={1}>
                  {currentWeaponDef.name}
                </Text>
                <Text style={styles.weaponLvlText}>
                  Уровень {currentWeaponLevel}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.resRow}>
              <Text style={[styles.resBadge, { color: COLORS.accentAmber }]}>
                Монеты: {cash}
              </Text>
              <Text style={[styles.resBadge, { color: COLORS.accentCyan }]}>
                Детали: {scrap}
              </Text>
            </View>
          </View>

          <View style={styles.waveCard}>
            <View style={styles.waveTopRow}>
              <View>
                <Text style={styles.waveKicker}>
                  {wavePhase === 'combat' ? 'ОБОРОНА' : 'ПОЛИГОН'}
                </Text>
                <Text style={styles.waveTitle}>Волна {wave}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  if (settings.hapticsEnabled) {
                    Haptics.selectionAsync().catch(() => {});
                  }
                  saveCurrentProgress();
                  setShowPauseModal(true);
                }}
                style={styles.pauseBtn}
              >
                <View style={styles.pauseBars}>
                  <View style={styles.pauseBar} />
                  <View style={styles.pauseBar} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.waveSub}>
              {wavePhase === 'combat'
                ? `Врагов: ${
                    zombiesRef.current.length + zombiesRemainingToSpawn
                  }`
                : 'Передышка и подготовка'}
            </Text>
            <Text style={styles.baseTagText} numberOfLines={1}>
              {currentBaseDef.title}
            </Text>
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.bottomCol}>
          {!playerNearPolygon && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                playerPosRef.current = {
                  x: BASE_CENTER_X,
                  y: BASE_CENTER_Y + 42,
                };
              }}
              style={styles.returnBasePill}
            >
              <Text style={styles.returnBaseText}>
                Вернуться на полигон ({Math.round(distFromBaseCenter)} м)
              </Text>
            </TouchableOpacity>
          )}

          <View pointerEvents="box-none" style={styles.bottomBtnsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (settings.hapticsEnabled) {
                  Haptics.selectionAsync().catch(() => {});
                }
                setShowWorkshopModal(true);
              }}
              style={styles.workshopBtn}
            >
              <Text style={styles.workshopBtnKicker}>МАСТЕРСКАЯ И БАЗА</Text>
              <Text style={styles.workshopBtnTitle}>
                Крафт · Навыки · Вышка
              </Text>
            </TouchableOpacity>

            {wavePhase === 'polygon' && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => startCombatWave(wave)}
                style={styles.startWaveBtn}
              >
                <Text style={styles.startWaveKicker}>ГОТОВНОСТЬ</Text>
                <Text style={styles.startWaveTitle}>Начать волну {wave}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <CraftingAndSkillsModal
        visible={showWorkshopModal}
        cash={cash}
        scrap={scrap}
        equippedWeaponId={equippedWeaponId}
        weapons={weapons}
        skills={skills}
        baseStage={baseStage}
        turretUpgradeLevel={turretUpgradeLevel}
        hapticsEnabled={settings.hapticsEnabled}
        onCraftOrEquipWeapon={handleCraftOrEquipWeapon}
        onUpgradeWeapon={handleUpgradeWeapon}
        onUpgradeSkill={handleUpgradeSkill}
        onUpgradeBaseStage={handleUpgradeBaseStage}
        onUpgradeTurrets={handleUpgradeTurrets}
        onClose={() => setShowWorkshopModal(false)}
      />

      <PauseSettingsModal
        visible={showPauseModal}
        wave={wave}
        cash={cash}
        scrap={scrap}
        settings={settings}
        onUpdateSettings={(next) => {
          setSettings(next);
          setTimeout(() => saveCurrentProgress(), 50);
        }}
        onResume={() => setShowPauseModal(false)}
        onSaveAndExitToMenu={() => {
          saveCurrentProgress();
          setShowPauseModal(false);
          setShowMainMenu(true);
        }}
      />

      <ReviveModal
        visible={showReviveModal}
        currentWave={wave}
        cash={cash}
        onRevive={handleRevive}
      />

      <MainMenuOverlay
        visible={showMainMenu}
        hasActiveSave={hasActiveSave}
        wave={wave}
        cash={cash}
        scrap={scrap}
        totalKills={totalKills}
        equippedWeaponId={equippedWeaponId}
        baseStage={baseStage}
        armorLevel={skills.armorLevel}
        hapticsEnabled={settings.hapticsEnabled}
        onContinueGame={() => setShowMainMenu(false)}
        onNewGame={handleNewGame}
        onOpenSettings={() => setShowPauseModal(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#172816',
  },
  arenaContainer: {
    flex: 1,
    backgroundColor: '#172816',
  },
  mapArtImage: {
    position: 'absolute',
    width: MAP_SIZE,
    height: MAP_SIZE,
  },
  baseCompoundWrapper: {
    position: 'absolute',
    width: 520,
    height: 520,
  },
  entityBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zombieHpBg: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderWidth: 0.8,
    borderColor: '#111827',
    overflow: 'hidden',
    marginBottom: -4,
  },
  zombieHpFill: {
    height: '100%',
    backgroundColor: COLORS.accentRed,
  },
  safeShieldTag: {
    marginTop: -6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.55)',
  },
  safeShieldText: {
    color: COLORS.accentCyan,
    fontSize: 9,
    fontWeight: '600',
  },
  popupBox: {
    position: 'absolute',
    width: 160,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hudSafe: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  statusCard: {
    flex: 1.18,
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  hpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hpLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  hpVal: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  hpBarBg: {
    width: '100%',
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 7,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  hudWeaponSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    borderRadius: 9,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 6,
  },
  weaponNameText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  weaponLvlText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '500',
  },
  resRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resBadge: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  waveCard: {
    flex: 0.88,
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  waveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  waveKicker: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  waveTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pauseBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 3.5,
  },
  pauseBar: {
    width: 2.5,
    height: 11,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 1,
  },
  waveSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  baseTagText: {
    color: COLORS.accentCyan,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomCol: {
    gap: 8,
  },
  returnBasePill: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 19, 27, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  returnBaseText: {
    color: COLORS.accentCyan,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  workshopBtn: {
    flex: 1.15,
    backgroundColor: COLORS.glassBg,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  workshopBtnKicker: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  workshopBtnTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  startWaveBtn: {
    flex: 0.95,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  startWaveKicker: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  startWaveTitle: {
    color: '#0D1014',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
