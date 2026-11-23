import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { BaseStageId, WeaponId, ZombieType } from '../types/game';
import { BASE_STAGES } from '../constants/gameData';

interface SurvivorSvgProps {
  aimAngleDeg: number;
  walkPhase: number;
  isMoving: boolean;
  isFiring: boolean;
  weaponId: WeaponId;
  armorLevel: number;
}

export const SurvivorSvg: React.FC<SurvivorSvgProps> = React.memo(
  ({ aimAngleDeg, walkPhase, isMoving, isFiring, weaponId, armorLevel }) => {
    const size = 86;
    const cx = size / 2;

    const aimRad = (aimAngleDeg * Math.PI) / 180;
    const facingLeft = Math.cos(aimRad) < 0;

    let localAimDeg = aimAngleDeg;
    if (facingLeft) {
      localAimDeg = 180 - aimAngleDeg;
      while (localAimDeg > 180) localAimDeg -= 360;
      while (localAimDeg < -180) localAimDeg += 360;
    }

    const legSwing = isMoving ? Math.sin(walkPhase) * 6 : 0;
    const bodyBob = isMoving ? Math.abs(Math.cos(walkPhase)) * 2 : 0;
    const recoil = isFiring ? -3.5 : 0;

    const vestColor =
      armorLevel >= 5
        ? '#1D4ED8'
        : armorLevel >= 2
        ? '#334155'
        : '#4D6B3C';
    const helmetColor =
      armorLevel >= 5
        ? '#2563EB'
        : armorLevel >= 2
        ? '#475569'
        : '#5B7A47';

    return (
      <Svg width={size} height={size} viewBox="0 0 86 86">
        {/* Crisp Ground Drop Shadow matching the painted map style */}
        <Ellipse cx={cx} cy={69} rx={16} ry={6} fill="rgba(10, 18, 12, 0.55)" />

        <G
          transform={
            facingLeft ? `translate(${size}, 0) scale(-1, 1)` : undefined
          }
        >
          {/* Tactical Rucksack */}
          <Rect
            x={26}
            y={33 - bodyBob}
            width={10}
            height={18}
            rx={3.5}
            fill="#854D0E"
            stroke="#111827"
            strokeWidth={1.8}
          />
          <Rect
            x={27}
            y={35 - bodyBob}
            width={8}
            height={6}
            rx={2}
            fill="#A16207"
          />

          {/* Left Boot & Leg */}
          <G transform={`translate(${-legSwing}, 0)`}>
            <Rect
              x={35}
              y={51}
              width={6.5}
              height={11}
              rx={2}
              fill="#334155"
              stroke="#111827"
              strokeWidth={1.6}
            />
            <Rect
              x={34}
              y={60}
              width={9}
              height={5.5}
              rx={2.5}
              fill="#1E293B"
              stroke="#111827"
              strokeWidth={1.6}
            />
          </G>

          {/* Right Boot & Leg */}
          <G transform={`translate(${legSwing}, 0)`}>
            <Rect
              x={43.5}
              y={51}
              width={6.5}
              height={11}
              rx={2}
              fill="#334155"
              stroke="#111827"
              strokeWidth={1.6}
            />
            <Rect
              x={43}
              y={60}
              width={9}
              height={5.5}
              rx={2.5}
              fill="#1E293B"
              stroke="#111827"
              strokeWidth={1.6}
            />
          </G>

          {/* Torso & Armored Vest */}
          <G transform={`translate(0, ${-bodyBob})`}>
            <Rect
              x={32}
              y={32}
              width={20}
              height={22}
              rx={6}
              fill={vestColor}
              stroke="#111827"
              strokeWidth={1.8}
            />
            {/* Tactical Chest Pouches & Belt */}
            <Rect
              x={35}
              y={38}
              width={14}
              height={9}
              rx={2.5}
              fill="#1E293B"
              stroke="#111827"
              strokeWidth={1.2}
            />
            <Rect x={36.5} y={40} width={4.5} height={5.5} rx={1} fill="#64748B" />
            <Rect x={43} y={40} width={4.5} height={5.5} rx={1} fill="#64748B" />
            <Rect
              x={32}
              y={49}
              width={20}
              height={4}
              fill="#78350F"
              stroke="#111827"
              strokeWidth={1.2}
            />
            <Rect x={40} y={49} width={4.5} height={4} fill="#F59E0B" />

            {/* Head & Face */}
            <Circle
              cx={42}
              cy={22}
              r={10.5}
              fill="#FDBA74"
              stroke="#111827"
              strokeWidth={1.8}
            />
            {/* Tactical Scarf / Mask */}
            <Path
              d="M32.5,24 Q42,27.5 51.5,24 L50.5,31.5 Q42,34.5 33.5,31.5 Z"
              fill="#1E293B"
              stroke="#111827"
              strokeWidth={1.5}
            />
            {/* Glowing Tactical Goggles */}
            <Rect
              x={39}
              y={18.5}
              width={13}
              height={6}
              rx={2.5}
              fill="#0F172A"
              stroke="#111827"
              strokeWidth={1.5}
            />
            <Rect x={41} y={20} width={9} height={3} rx={1} fill="#38BDF8" />

            {/* Stylized Combat Helmet */}
            <Path
              d="M30.5,21 C30.5,10.5 53.5,10.5 53.5,21 L54.5,22.5 L29.5,22.5 Z"
              fill={helmetColor}
              stroke="#111827"
              strokeWidth={1.8}
            />
            {/* Helmet Highlight & Strap */}
            <Path
              d="M34,16 Q42,13 49,16"
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Pivoting Arms & Weapon */}
            <G rotation={localAimDeg} origin="42, 41">
              <G transform={`translate(${recoil}, 0)`}>
                {/* Shoulder & Arm */}
                <Rect
                  x={36}
                  y={38}
                  width={12}
                  height={6}
                  rx={3}
                  fill={vestColor}
                  stroke="#111827"
                  strokeWidth={1.5}
                />

                {weaponId === 'pistol' && (
                  <G>
                    <Rect
                      x={48}
                      y={39}
                      width={4.5}
                      height={7.5}
                      rx={1}
                      fill="#1E293B"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                    <Rect
                      x={47}
                      y={34.5}
                      width={15}
                      height={6}
                      rx={1.5}
                      fill="#94A3B8"
                      stroke="#111827"
                      strokeWidth={1.5}
                    />
                  </G>
                )}

                {weaponId === 'smg' && (
                  <G>
                    <Rect
                      x={46}
                      y={39}
                      width={4.5}
                      height={8}
                      rx={1}
                      fill="#1E293B"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                    <Rect
                      x={55}
                      y={40}
                      width={4}
                      height={9.5}
                      rx={1}
                      fill="#38BDF8"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                    <Rect
                      x={44}
                      y={34}
                      width={20}
                      height={7}
                      rx={2}
                      fill="#475569"
                      stroke="#111827"
                      strokeWidth={1.5}
                    />
                    <Rect
                      x={64}
                      y={35.5}
                      width={8}
                      height={4}
                      rx={1}
                      fill="#1E293B"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                  </G>
                )}

                {weaponId === 'shotgun' && (
                  <G>
                    <Polygon
                      points="37,42 46,37 46,42 38,46"
                      fill="#92400E"
                      stroke="#111827"
                      strokeWidth={1.4}
                    />
                    <Rect
                      x={45}
                      y={34.5}
                      width={14}
                      height={6.5}
                      rx={1.5}
                      fill="#475569"
                      stroke="#111827"
                      strokeWidth={1.5}
                    />
                    <Rect
                      x={59}
                      y={35}
                      width={16}
                      height={3.8}
                      fill="#94A3B8"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                    <Rect
                      x={59}
                      y={38.5}
                      width={11}
                      height={4}
                      rx={1.5}
                      fill="#B45309"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                  </G>
                )}

                {weaponId === 'rifle' && (
                  <G>
                    <Polygon
                      points="36,37 45,37 45,43 37,45"
                      fill="#78350F"
                      stroke="#111827"
                      strokeWidth={1.4}
                    />
                    <Path
                      d="M53,40 L58,40 L60,49 L55,50 Z"
                      fill="#F59E0B"
                      stroke="#111827"
                      strokeWidth={1.3}
                    />
                    <Rect
                      x={44}
                      y={34.5}
                      width={19}
                      height={6.8}
                      rx={1.5}
                      fill="#334155"
                      stroke="#111827"
                      strokeWidth={1.5}
                    />
                    <Rect
                      x={63}
                      y={36}
                      width={13}
                      height={3.5}
                      fill="#94A3B8"
                      stroke="#111827"
                      strokeWidth={1.2}
                    />
                    <Rect
                      x={48}
                      y={31}
                      width={8}
                      height={3.5}
                      rx={1}
                      fill="#34D399"
                      stroke="#111827"
                      strokeWidth={1.1}
                    />
                  </G>
                )}

                {weaponId === 'sniper' && (
                  <G>
                    <Polygon
                      points="35,37 44,37 44,43 35,45"
                      fill="#1E293B"
                      stroke="#111827"
                      strokeWidth={1.4}
                    />
                    <Rect
                      x={44}
                      y={34.5}
                      width={17}
                      height={6}
                      rx={1.5}
                      fill="#475569"
                      stroke="#111827"
                      strokeWidth={1.5}
                    />
                    <Rect
                      x={61}
                      y={36}
                      width={19}
                      height={3}
                      fill="#E2E8F0"
                      stroke="#111827"
                      strokeWidth={1.1}
                    />
                    <Rect
                      x={46}
                      y={30}
                      width={14}
                      height={4.2}
                      rx={1.5}
                      fill="#818CF8"
                      stroke="#111827"
                      strokeWidth={1.3}
                    />
                  </G>
                )}

                {weaponId === 'railgun' && (
                  <G>
                    <Rect
                      x={42}
                      y={33}
                      width={26}
                      height={9}
                      rx={2.5}
                      fill="#1E293B"
                      stroke="#111827"
                      strokeWidth={1.6}
                    />
                    <Rect
                      x={68}
                      y={34}
                      width={11}
                      height={3.2}
                      fill="#38BDF8"
                      stroke="#111827"
                      strokeWidth={1}
                    />
                    <Rect
                      x={68}
                      y={38.5}
                      width={11}
                      height={3.2}
                      fill="#38BDF8"
                      stroke="#111827"
                      strokeWidth={1}
                    />
                    <Line
                      x1={46}
                      y1={37.5}
                      x2={77}
                      y2={37.5}
                      stroke="#7DD3FC"
                      strokeWidth={2.5}
                    />
                  </G>
                )}

                {/* Hand gripping forend */}
                <Circle
                  cx={51}
                  cy={40.5}
                  r={3.2}
                  fill="#FDBA74"
                  stroke="#111827"
                  strokeWidth={1.3}
                />

                {/* Bright Cartoon/Tactical Muzzle Flash */}
                {isFiring && (
                  <Polygon
                    points="74,37 85,31 80,37 86,38 80,40 84,45"
                    fill="#FEF08A"
                    stroke="#F59E0B"
                    strokeWidth={1.2}
                  />
                )}
              </G>
            </G>
          </G>
        </G>
      </Svg>
    );
  }
);

interface ZombieSvgProps {
  type: ZombieType;
  angleDeg: number;
  walkPhase: number;
  hitFlash: boolean;
}

export const ZombieSvg: React.FC<ZombieSvgProps> = React.memo(
  ({ type, angleDeg, walkPhase, hitFlash }) => {
    const scale =
      type === 'boss'
        ? 1.48
        : type === 'armored'
        ? 1.16
        : type === 'runner'
        ? 0.94
        : 1;
    const size = Math.round(70 * scale);

    const rad = (angleDeg * Math.PI) / 180;
    const facingLeft = Math.cos(rad) < 0;

    const legSwing = Math.sin(walkPhase) * 5.5;
    const armBob = Math.cos(walkPhase) * 3.5;
    const bodyBob = Math.abs(Math.sin(walkPhase)) * 2;

    let skinColor = '#84CC16';
    let coatColor = '#3F3F46';
    let eyeColor = '#FEF08A';

    if (type === 'runner') {
      skinColor = '#DC2626';
      coatColor = '#7F1D1D';
      eyeColor = '#FEF08A';
    } else if (type === 'armored') {
      skinColor = '#65A30D';
      coatColor = '#334155';
      eyeColor = '#F59E0B';
    } else if (type === 'boss') {
      skinColor = '#7E22CE';
      coatColor = '#31104B';
      eyeColor = '#F43F5E';
    }

    if (hitFlash) {
      skinColor = '#FFFFFF';
      coatColor = '#F8FAFC';
      eyeColor = '#FFFFFF';
    }

    return (
      <Svg width={size} height={size} viewBox="0 0 70 70">
        <Ellipse cx={35} cy={58} rx={14} ry={5} fill="rgba(10, 18, 12, 0.52)" />

        <G
          transform={
            facingLeft ? 'translate(70, 0) scale(-1, 1)' : undefined
          }
        >
          {/* Shambling Boots */}
          <Rect
            x={28 - legSwing}
            y={44}
            width={6}
            height={12}
            rx={2.5}
            fill="#1E293B"
            stroke="#111827"
            strokeWidth={1.5}
          />
          <Rect
            x={35 + legSwing}
            y={44}
            width={6}
            height={12}
            rx={2.5}
            fill="#0F172A"
            stroke="#111827"
            strokeWidth={1.5}
          />

          <G transform={`translate(0, ${-bodyBob})`}>
            {/* Back Zombie Arm */}
            <Path
              d={`M36,29 L53,${26 + armBob} L53,${31 + armBob} L36,34 Z`}
              fill={skinColor}
              stroke="#111827"
              strokeWidth={1.5}
            />

            {/* Hunched Torso */}
            <Polygon
              points="25,27 43,26 45,46 24,46"
              fill={coatColor}
              stroke="#111827"
              strokeWidth={1.8}
            />

            {/* Armored Riot Plate */}
            {(type === 'armored' || type === 'boss') && (
              <Rect
                x={28}
                y={29}
                width={15}
                height={14}
                rx={3}
                fill="#64748B"
                stroke="#111827"
                strokeWidth={1.5}
              />
            )}

            {/* Zombie Head */}
            <Circle
              cx={37}
              cy={18}
              r={9.5}
              fill={skinColor}
              stroke="#111827"
              strokeWidth={1.8}
            />

            {type === 'armored' && (
              <Path
                d="M27,17 C27,8.5 47,8.5 47,17 Z"
                fill="#475569"
                stroke="#111827"
                strokeWidth={1.6}
              />
            )}
            {type === 'boss' && (
              <Polygon
                points="28,12 33,3 37,11 42,3 45,12"
                fill="#F43F5E"
                stroke="#111827"
                strokeWidth={1.4}
              />
            )}

            {/* Glowing Eyes & Mouth */}
            <Circle cx={40} cy={17} r={2.3} fill={eyeColor} />
            <Circle cx={44.5} cy={17} r={2} fill={eyeColor} />
            <Rect
              x={38}
              y={22}
              width={6.5}
              height={2.5}
              rx={1}
              fill="#111827"
            />

            {/* Front Zombie Arm */}
            <Path
              d={`M32,31 L51,${31 - armBob} L51,${36 - armBob} L32,37 Z`}
              fill={skinColor}
              stroke="#111827"
              strokeWidth={1.5}
            />
          </G>
        </G>
      </Svg>
    );
  }
);

interface BaseCompoundSvgProps {
  baseStage: BaseStageId;
  turretAngleDeg: number;
  playerInSafeZone: boolean;
}

export const BaseCompoundSvg: React.FC<BaseCompoundSvgProps> = React.memo(
  ({ baseStage, turretAngleDeg, playerInSafeZone }) => {
    const stageDef = BASE_STAGES[baseStage] || BASE_STAGES[0];
    const safeR = stageDef.safeRadius;
    const boxSize = 520;
    const cx = boxSize / 2;
    const cy = boxSize / 2;

    const turretPositions =
      baseStage === 1
        ? [[0, -28]]
        : baseStage === 2
        ? [
            [-84, -84],
            [84, 84],
          ]
        : baseStage === 3
        ? [
            [-115, -115],
            [115, -115],
            [-115, 115],
            [115, 115],
          ]
        : [];

    return (
      <Svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`}>
        <Defs>
          <RadialGradient id="safeFieldGrad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop
              offset="0%"
              stopColor="#38BDF8"
              stopOpacity={playerInSafeZone ? '0.03' : '0.01'}
            />
            <Stop
              offset="80%"
              stopColor="#38BDF8"
              stopOpacity={playerInSafeZone ? '0.12' : '0.05'}
            />
            <Stop
              offset="100%"
              stopColor="#7DD3FC"
              stopOpacity={playerInSafeZone ? '0.36' : '0.2'}
            />
          </RadialGradient>
        </Defs>

        {/* Protective Watchtower Dome (No dashed schematic lines) */}
        {safeR > 0 && (
          <Circle
            cx={cx}
            cy={cy}
            r={safeR}
            fill="url(#safeFieldGrad)"
            stroke={
              playerInSafeZone
                ? 'rgba(125, 211, 252, 0.85)'
                : 'rgba(56, 189, 248, 0.45)'
            }
            strokeWidth={3}
          />
        )}

        {/* Armory Workbench at South Edge of Stone Courtyard */}
        <G>
          <Ellipse
            cx={cx}
            cy={cy + 78}
            rx={36}
            ry={9}
            fill="rgba(0,0,0,0.45)"
          />
          <Rect
            x={cx - 32}
            y={cy + 58}
            width={64}
            height={19}
            rx={4}
            fill="#854D0E"
            stroke="#111827"
            strokeWidth={2}
          />
          <Rect
            x={cx - 22}
            y={cy + 61}
            width={20}
            height={12}
            rx={2}
            fill="#0284C7"
            stroke="#111827"
            strokeWidth={1.2}
          />
          <Circle
            cx={cx + 20}
            cy={cy + 67}
            r={4.5}
            fill="#FEF08A"
            stroke="#111827"
            strokeWidth={1.2}
          />
        </G>

        {/* Stage 3: Military Village Buildings (Garrison & Armory Forge) */}
        {baseStage >= 3 && (
          <>
            {/* Left Garrison Building */}
            <G>
              <Ellipse
                cx={cx - 82}
                cy={cy + 26}
                rx={28}
                ry={10}
                fill="rgba(0,0,0,0.48)"
              />
              <Rect
                x={cx - 104}
                y={cy - 28}
                width={44}
                height={52}
                rx={4}
                fill="#78350F"
                stroke="#111827"
                strokeWidth={2}
              />
              <Polygon
                points={`${cx - 108},${cy - 26} ${cx - 82},${cy - 45} ${cx - 56},${cy - 26}`}
                fill="#991B1B"
                stroke="#111827"
                strokeWidth={2}
              />
              <Rect
                x={cx - 96}
                y={cy - 16}
                width={10}
                height={10}
                rx={2}
                fill="#FEF08A"
                stroke="#111827"
                strokeWidth={1.4}
              />
              <Rect
                x={cx - 78}
                y={cy - 16}
                width={10}
                height={10}
                rx={2}
                fill="#FEF08A"
                stroke="#111827"
                strokeWidth={1.4}
              />
            </G>

            {/* Right Armory Building */}
            <G>
              <Ellipse
                cx={cx + 82}
                cy={cy + 26}
                rx={28}
                ry={10}
                fill="rgba(0,0,0,0.48)"
              />
              <Rect
                x={cx + 60}
                y={cy - 28}
                width={44}
                height={52}
                rx={4}
                fill="#475569"
                stroke="#111827"
                strokeWidth={2}
              />
              <Polygon
                points={`${cx + 56},${cy - 26} ${cx + 82},${cy - 45} ${cx + 108},${cy - 26}`}
                fill="#1E3A8A"
                stroke="#111827"
                strokeWidth={2}
              />
              <Rect
                x={cx + 68}
                y={cy - 16}
                width={28}
                height={13}
                rx={2}
                fill="#38BDF8"
                stroke="#111827"
                strokeWidth={1.5}
              />
              <Circle
                cx={cx + 82}
                cy={cy + 10}
                r={6.5}
                fill="#F59E0B"
                stroke="#111827"
                strokeWidth={1.4}
              />
            </G>
          </>
        )}

        {/* Stage 1+: Painted 2.5D Timber & Iron Watchtower in Center */}
        {baseStage >= 1 && (
          <G>
            <Ellipse
              cx={cx}
              cy={cy + 18}
              rx={34}
              ry={12}
              fill="rgba(0,0,0,0.52)"
            />
            {/* Sandbag Ring at Watchtower Base */}
            <Circle
              cx={cx}
              cy={cy + 6}
              r={26}
              fill="#B45309"
              stroke="#111827"
              strokeWidth={2}
            />
            {/* Timber Legs */}
            <Polygon
              points={`${cx - 24},${cy + 14} ${cx - 17},${cy + 14} ${cx - 12},${cy - 24} ${cx - 18},${cy - 24}`}
              fill="#78350F"
              stroke="#111827"
              strokeWidth={1.6}
            />
            <Polygon
              points={`${cx + 24},${cy + 14} ${cx + 17},${cy + 14} ${cx + 12},${cy - 24} ${cx + 18},${cy - 24}`}
              fill="#78350F"
              stroke="#111827"
              strokeWidth={1.6}
            />
            {/* Wooden Ladder */}
            <Rect
              x={cx - 6}
              y={cy - 18}
              width={12}
              height={32}
              fill="none"
              stroke="#111827"
              strokeWidth={2}
            />
            <Line
              x1={cx - 6}
              y1={cy - 10}
              x2={cx + 6}
              y2={cy - 10}
              stroke="#D97706"
              strokeWidth={2.5}
            />
            <Line
              x1={cx - 6}
              y1={cy - 2}
              x2={cx + 6}
              y2={cy - 2}
              stroke="#D97706"
              strokeWidth={2.5}
            />
            <Line
              x1={cx - 6}
              y1={cy + 6}
              x2={cx + 6}
              y2={cy + 6}
              stroke="#D97706"
              strokeWidth={2.5}
            />

            {/* Watchtower Sniper Cabin */}
            <Rect
              x={cx - 26}
              y={cy - 40}
              width={52}
              height={24}
              rx={5}
              fill="#78350F"
              stroke="#111827"
              strokeWidth={2}
            />
            {/* Shingled Roof */}
            <Polygon
              points={`${cx - 32},${cy - 38} ${cx},${cy - 58} ${cx + 32},${cy - 38}`}
              fill="#B45309"
              stroke="#111827"
              strokeWidth={2}
            />
            <Circle
              cx={cx}
              cy={cy - 44}
              r={4.5}
              fill="#FEF08A"
              stroke="#111827"
              strokeWidth={1.4}
            />
          </G>
        )}

        {/* Twin-Barrel Auto-Turrets */}
        {turretPositions.map(([ox, oy], idx) => {
          const tx = cx + ox;
          const ty = cy + oy;
          return (
            <G key={`turret-${idx}`}>
              <Ellipse
                cx={tx}
                cy={ty + 8}
                rx={15}
                ry={6}
                fill="rgba(0,0,0,0.45)"
              />
              <Circle
                cx={tx}
                cy={ty}
                r={13}
                fill="#475569"
                stroke="#111827"
                strokeWidth={2}
              />
              <G rotation={turretAngleDeg} origin={`${tx}, ${ty}`}>
                <Rect
                  x={tx + 4}
                  y={ty - 5}
                  width={17}
                  height={3.5}
                  rx={1}
                  fill="#CBD5E1"
                  stroke="#111827"
                  strokeWidth={1.2}
                />
                <Rect
                  x={tx + 4}
                  y={ty + 1.5}
                  width={17}
                  height={3.5}
                  rx={1}
                  fill="#CBD5E1"
                  stroke="#111827"
                  strokeWidth={1.2}
                />
                <Rect
                  x={tx - 8}
                  y={ty - 8}
                  width={16}
                  height={16}
                  rx={4}
                  fill="#1E293B"
                  stroke="#111827"
                  strokeWidth={1.8}
                />
                <Circle cx={tx} cy={ty} r={4} fill="#F59E0B" />
              </G>
            </G>
          );
        })}
      </Svg>
    );
  }
);
