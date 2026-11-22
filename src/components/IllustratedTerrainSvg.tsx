import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { BaseStageId } from '../types/game';
import { BASE_STAGES } from '../constants/gameData';

interface IllustratedTerrainSvgProps {
  baseStage: BaseStageId;
  turretAngleDeg: number;
  playerInSafeZone: boolean;
}

export const IllustratedTerrainSvg: React.FC<IllustratedTerrainSvgProps> =
  React.memo(({ baseStage, turretAngleDeg, playerInSafeZone }) => {
    const stageDef = BASE_STAGES[baseStage] || BASE_STAGES[0];
    const safeR = stageDef.safeRadius;
    const size = 1400;
    const cx = size / 2;
    const cy = size / 2;

    const turretPositions =
      baseStage === 1
        ? [[0, -30]]
        : baseStage === 2
        ? [
            [-86, -86],
            [86, 86],
          ]
        : baseStage === 3
        ? [
            [-118, -118],
            [118, -118],
            [-118, 118],
            [118, 118],
          ]
        : [];

    // Decorative Cobblestones on the Courtyard
    const stones = [
      [-65, -55, 26, 18],
      [-28, -68, 30, 20],
      [18, -62, 28, 18],
      [55, -48, 24, 20],
      [-74, -18, 28, 22],
      [-32, -25, 34, 24],
      [22, -22, 32, 22],
      [62, -12, 26, 20],
      [-68, 24, 30, 20],
      [-22, 22, 32, 22],
      [26, 25, 28, 20],
      [60, 30, 24, 18],
      [-45, 58, 32, 18],
      [10, 62, 30, 18],
    ];

    // Grass Patches & Meadow Details around the Clearing
    const grassPatches = [
      [-260, -220, 95, 65],
      [280, -240, 110, 75],
      [-310, 210, 105, 70],
      [270, 250, 115, 80],
      [-180, -390, 90, 60],
      [210, 410, 100, 65],
      [-420, -60, 85, 70],
      [430, 80, 95, 65],
    ];

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Lush Forest Meadow Radial Gradient */}
          <RadialGradient id="clearingGrad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#3B5932" />
            <Stop offset="45%" stopColor="#2C4627" />
            <Stop offset="80%" stopColor="#1F341D" />
            <Stop offset="100%" stopColor="#172816" />
          </RadialGradient>

          {/* Warm Dirt Courtyard Gradient */}
          <RadialGradient id="courtyardEarth" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#7C6244" />
            <Stop offset="70%" stopColor="#634D34" />
            <Stop offset="100%" stopColor="#4A3926" />
          </RadialGradient>

          {/* Stone Plaza Gradient */}
          <LinearGradient id="stonePlaza" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#57534E" />
            <Stop offset="50%" stopColor="#44403C" />
            <Stop offset="100%" stopColor="#292524" />
          </LinearGradient>

          {/* Warm Lantern Glow */}
          <RadialGradient id="lanternGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.48" />
            <Stop offset="50%" stopColor="#D97706" stopOpacity="0.16" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </RadialGradient>

          {/* Safe Dome Shield Shimmer */}
          <RadialGradient id="safeDomeGrad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop
              offset="0%"
              stopColor="#38BDF8"
              stopOpacity={playerInSafeZone ? '0.04' : '0.02'}
            />
            <Stop
              offset="82%"
              stopColor="#38BDF8"
              stopOpacity={playerInSafeZone ? '0.14' : '0.07'}
            />
            <Stop
              offset="100%"
              stopColor="#7DD3FC"
              stopOpacity={playerInSafeZone ? '0.32' : '0.18'}
            />
          </RadialGradient>
        </Defs>

        {/* Base Forest Meadow Background */}
        <Rect x={0} y={0} width={size} height={size} fill="url(#clearingGrad)" />

        {/* Soft Organic Grassy Mounds */}
        {grassPatches.map(([gx, gy, rx, ry], idx) => (
          <Ellipse
            key={`gp-${idx}`}
            cx={cx + gx}
            cy={cy + gy}
            rx={rx}
            ry={ry}
            fill="#35522D"
            fillOpacity={0.65}
          />
        ))}

        {/* Winding Organic Dirt Roads Leading into the Central Outpost */}
        {/* North-South Winding Dirt Road */}
        <Path
          d={`M ${cx - 46} 0 Q ${cx - 28} ${cy - 300} ${cx - 48} ${cy} Q ${cx - 64} ${cy + 300} ${cx - 42} ${size} L ${cx + 46} ${size} Q ${cx + 28} ${cy + 300} ${cx + 48} ${cy} Q ${cx + 64} ${cy - 300} ${cx + 44} 0 Z`}
          fill="#5C4730"
        />
        <Path
          d={`M ${cx - 28} 0 Q ${cx - 12} ${cy - 300} ${cx - 30} ${cy} Q ${cx - 46} ${cy + 300} ${cx - 26} ${size} L ${cx + 28} ${size} Q ${cx + 12} ${cy + 300} ${cx + 30} ${cy} Q ${cx + 46} ${cy - 300} ${cx + 26} 0 Z`}
          fill="#755B3E"
        />

        {/* East-West Winding Dirt Road */}
        <Path
          d={`M 0 ${cy - 44} Q ${cx - 300} ${cy - 62} ${cx} ${cy - 46} Q ${cx + 300} ${cy - 28} ${size} ${cy - 44} L ${size} ${cy + 44} Q ${cx + 300} ${cy + 62} ${cx} ${cy + 46} Q ${cx - 300} ${cy + 28} 0 ${cy + 44} Z`}
          fill="#5C4730"
        />
        <Path
          d={`M 0 ${cy - 26} Q ${cx - 300} ${cy - 44} ${cx} ${cy - 28} Q ${cx + 300} ${cy - 12} ${size} ${cy - 26} L ${size} ${cy + 26} Q ${cx + 300} ${cy + 44} ${cx} ${cy + 28} Q ${cx - 300} ${cy + 12} 0 ${cy + 26} Z`}
          fill="#755B3E"
        />

        {/* Central Outpost Earth Clearing */}
        <Circle cx={cx} cy={cy} r={175} fill="url(#courtyardEarth)" />

        {/* Safe Zone Glowing Protective Dome (No dashed schematic lines!) */}
        {safeR > 0 && (
          <G>
            <Circle
              cx={cx}
              cy={cy}
              r={safeR}
              fill="url(#safeDomeGrad)"
              stroke={
                playerInSafeZone
                  ? 'rgba(125, 211, 252, 0.75)'
                  : 'rgba(56, 189, 248, 0.4)'
              }
              strokeWidth={3}
            />
            {/* Wooden & Iron Perimeter Barrier Posts */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 2 * Math.PI) / 12;
              const px = cx + Math.cos(a) * safeR;
              const py = cy + Math.sin(a) * safeR;
              return (
                <G key={`stake-${i}`}>
                  <Ellipse
                    cx={px}
                    cy={py + 4}
                    rx={6}
                    ry={3}
                    fill="rgba(0,0,0,0.4)"
                  />
                  <Rect
                    x={px - 4}
                    y={py - 8}
                    width={8}
                    height={13}
                    rx={2.5}
                    fill="#573B1A"
                    stroke="#3E270E"
                    strokeWidth={1}
                  />
                  <Circle
                    cx={px}
                    cy={py - 6}
                    r={2.8}
                    fill={playerInSafeZone ? '#7DD3FC' : '#38BDF8'}
                  />
                </G>
              );
            })}
          </G>
        )}

        {/* Stone-Paved Polygon Courtyard */}
        <Rect
          x={cx - 106}
          y={cy - 98}
          width={212}
          height={204}
          rx={32}
          fill="rgba(0,0,0,0.38)"
        />
        <Rect
          x={cx - 104}
          y={cy - 104}
          width={208}
          height={200}
          rx={32}
          fill="url(#stonePlaza)"
          stroke="#78716C"
          strokeWidth={3}
        />

        {/* Textured Stone Slabs inside Courtyard */}
        {stones.map(([sx, sy, sw, sh], idx) => (
          <Rect
            key={`st-${idx}`}
            x={cx + sx}
            y={cy + sy}
            width={sw}
            height={sh}
            rx={5}
            fill={idx % 2 === 0 ? '#57534E' : '#44403C'}
            stroke="#292524"
            strokeWidth={1.2}
          />
        ))}

        {/* Warm Campfire / Lantern Light Pools on the Polygon */}
        <Circle cx={cx - 75} cy={cy - 75} r={65} fill="url(#lanternGlow)" />
        <Circle cx={cx + 75} cy={cy - 75} r={65} fill="url(#lanternGlow)" />
        <Circle cx={cx} cy={cy + 65} r={75} fill="url(#lanternGlow)" />

        {/* Stage 2 & 3: Solid Timber & Stone Fortified Ramparts (Military Village) */}
        {baseStage >= 2 && (
          <G>
            {/* North Wall Rampart */}
            <Rect
              x={cx - 108}
              y={cy - 114}
              width={82}
              height={16}
              rx={4}
              fill="#57534E"
              stroke="#292524"
              strokeWidth={2}
            />
            <Rect
              x={cx + 26}
              y={cy - 114}
              width={82}
              height={16}
              rx={4}
              fill="#57534E"
              stroke="#292524"
              strokeWidth={2}
            />
            {/* South Wall Rampart */}
            <Rect
              x={cx - 108}
              y={cy + 94}
              width={82}
              height={16}
              rx={4}
              fill="#57534E"
              stroke="#292524"
              strokeWidth={2}
            />
            <Rect
              x={cx + 26}
              y={cy + 94}
              width={82}
              height={16}
              rx={4}
              fill="#57534E"
              stroke="#292524"
              strokeWidth={2}
            />
          </G>
        )}

        {/* Stage 3: Military Village Timber & Iron Buildings (Barracks & Armory) */}
        {baseStage >= 3 && (
          <>
            {/* Left Garrison Cabin */}
            <G>
              <Ellipse
                cx={cx - 76}
                cy={cy + 28}
                rx={28}
                ry={10}
                fill="rgba(0,0,0,0.45)"
              />
              <Rect
                x={cx - 98}
                y={cy - 28}
                width={44}
                height={54}
                rx={4}
                fill="#573B1A"
                stroke="#291A09"
                strokeWidth={2}
              />
              {/* Pitched Shingle Roof */}
              <Polygon
                points={`${cx - 102},${cy - 26} ${cx - 76},${cy - 44} ${cx - 50},${cy - 26}`}
                fill="#7F1D1D"
                stroke="#450A0A"
                strokeWidth={2}
              />
              <Polygon
                points={`${cx - 98},${cy - 26} ${cx - 76},${cy - 40} ${cx - 54},${cy - 26}`}
                fill="#991B1B"
              />
              {/* Warm Lit Windows */}
              <Rect
                x={cx - 90}
                y={cy - 16}
                width={10}
                height={10}
                rx={1.5}
                fill="#FEF08A"
                stroke="#78350F"
                strokeWidth={1.2}
              />
              <Rect
                x={cx - 72}
                y={cy - 16}
                width={10}
                height={10}
                rx={1.5}
                fill="#FEF08A"
                stroke="#78350F"
                strokeWidth={1.2}
              />
              {/* Cabin Door */}
              <Rect
                x={cx - 82}
                y={cy + 4}
                width={14}
                height={22}
                rx={2}
                fill="#3E270E"
              />
            </G>

            {/* Right Armory Forge Building */}
            <G>
              <Ellipse
                cx={cx + 76}
                cy={cy + 28}
                rx={28}
                ry={10}
                fill="rgba(0,0,0,0.45)"
              />
              <Rect
                x={cx + 54}
                y={cy - 28}
                width={44}
                height={54}
                rx={4}
                fill="#44403C"
                stroke="#1C1917"
                strokeWidth={2}
              />
              {/* Slate Pitched Roof */}
              <Polygon
                points={`${cx + 50},${cy - 26} ${cx + 76},${cy - 44} ${cx + 102},${cy - 26}`}
                fill="#1E3A8A"
                stroke="#172554"
                strokeWidth={2}
              />
              <Rect
                x={cx + 62}
                y={cy - 16}
                width={28}
                height={14}
                rx={2}
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth={1.5}
              />
              {/* Glowing Forge Anvil Sign */}
              <Circle cx={cx + 76} cy={cy + 12} r={7} fill="#F59E0B" />
            </G>
          </>
        )}

        {/* Sandbag Emplacements & Wooden Barrels at Courtyard Corners */}
        {[
          [cx - 92, cy - 90],
          [cx + 54, cy - 90],
          [cx - 92, cy + 72],
          [cx + 54, cy + 72],
        ].map(([bx, by], i) => (
          <G key={`bag-${i}`}>
            <Ellipse
              cx={bx + 18}
              cy={by + 12}
              rx={22}
              ry={6}
              fill="rgba(0,0,0,0.4)"
            />
            <Rect
              x={bx}
              y={by}
              width={18}
              height={11}
              rx={5}
              fill="#A16207"
              stroke="#713F12"
              strokeWidth={1.2}
            />
            <Rect
              x={bx + 15}
              y={by}
              width={18}
              height={11}
              rx={5}
              fill="#CA8A04"
              stroke="#713F12"
              strokeWidth={1.2}
            />
            <Rect
              x={bx + 7}
              y={by - 6}
              width={19}
              height={10}
              rx={5}
              fill="#EAB308"
              stroke="#713F12"
              strokeWidth={1.2}
            />
          </G>
        ))}

        {/* Armory Workbench with Glowing Lantern (Bottom of Courtyard) */}
        <G>
          <Ellipse
            cx={cx}
            cy={cy + 64}
            rx={38}
            ry={10}
            fill="rgba(0,0,0,0.45)"
          />
          <Rect
            x={cx - 34}
            y={cy + 44}
            width={68}
            height={20}
            rx={4}
            fill="#78350F"
            stroke="#451A03"
            strokeWidth={1.8}
          />
          {/* Wood Planks on Table */}
          <Rect x={cx - 30} y={cy + 47} width={60} height={6} fill="#92400E" />
          {/* Blueprint Map & Weapon Parts on Workbench */}
          <Rect
            x={cx - 24}
            y={cy + 48}
            width={22}
            height={12}
            rx={1.5}
            fill="#0284C7"
            stroke="#BAE6FD"
            strokeWidth={1}
          />
          {/* Warm Lantern on Table */}
          <Circle cx={cx + 22} cy={cy + 53} r={5} fill="#FEF08A" />
          <Circle
            cx={cx + 22}
            cy={cy + 53}
            r={9}
            fill="rgba(250, 204, 21, 0.35)"
          />
        </G>

        {/* Stage 1+: Detailed 2.5D Timber & Steel Watchtower in Center */}
        {baseStage >= 1 && (
          <G>
            <Ellipse
              cx={cx}
              cy={cy + 16}
              rx={34}
              ry={12}
              fill="rgba(0,0,0,0.5)"
            />
            {/* Sandbag Ring at Base of Watchtower */}
            <Circle
              cx={cx}
              cy={cy + 6}
              r={26}
              fill="#78350F"
              stroke="#451A03"
              strokeWidth={2}
            />
            {/* Heavy Timber Legs */}
            <Polygon
              points={`${cx - 24},${cy + 14} ${cx - 18},${cy + 14} ${cx - 12},${cy - 24} ${cx - 18},${cy - 24}`}
              fill="#78350F"
              stroke="#451A03"
              strokeWidth={1.2}
            />
            <Polygon
              points={`${cx + 24},${cy + 14} ${cx + 18},${cy + 14} ${cx + 12},${cy - 24} ${cx + 18},${cy - 24}`}
              fill="#78350F"
              stroke="#451A03"
              strokeWidth={1.2}
            />
            {/* Wooden Ladder */}
            <Rect x={cx - 6} y={cy - 18} width={2.5} height={34} fill="#92400E" />
            <Rect x={cx + 3.5} y={cy - 18} width={2.5} height={34} fill="#92400E" />
            <Rect x={cx - 5} y={cy - 10} width={10} height={2.2} fill="#B45309" />
            <Rect x={cx - 5} y={cy - 2} width={10} height={2.2} fill="#B45309" />
            <Rect x={cx - 5} y={cy + 6} width={10} height={2.2} fill="#B45309" />

            {/* Watchtower Upper Deck */}
            <Rect
              x={cx - 26}
              y={cy - 40}
              width={52}
              height={24}
              rx={5}
              fill="#573B1A"
              stroke="#291A09"
              strokeWidth={2}
            />
            {/* Watchtower Shingled Roof */}
            <Polygon
              points={`${cx - 32},${cy - 38} ${cx},${cy - 58} ${cx + 32},${cy - 38}`}
              fill="#92400E"
              stroke="#451A03"
              strokeWidth={2}
            />
            <Polygon
              points={`${cx - 26},${cy - 38} ${cx},${cy - 53} ${cx + 26},${cy - 38}`}
              fill="#B45309"
            />
            {/* Watchtower Lantern Beacon */}
            <Circle cx={cx} cy={cy - 44} r={4} fill="#FEF08A" />
          </G>
        )}

        {/* Heavy Twin-Barrel Auto-Turrets */}
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
                fill="#44403C"
                stroke="#1C1917"
                strokeWidth={2}
              />
              <G rotation={turretAngleDeg} origin={`${tx}, ${ty}`}>
                <Rect
                  x={tx + 4}
                  y={ty - 4.5}
                  width={16}
                  height={3}
                  rx={1}
                  fill="#A8A29E"
                  stroke="#1C1917"
                  strokeWidth={0.8}
                />
                <Rect
                  x={tx + 4}
                  y={ty + 1.5}
                  width={16}
                  height={3}
                  rx={1}
                  fill="#A8A29E"
                  stroke="#1C1917"
                  strokeWidth={0.8}
                />
                <Rect
                  x={tx - 8}
                  y={ty - 8}
                  width={16}
                  height={16}
                  rx={4}
                  fill="#292524"
                  stroke="#F59E0B"
                  strokeWidth={1.6}
                />
                <Circle cx={tx} cy={ty} r={3.5} fill="#38BDF8" />
              </G>
            </G>
          );
        })}
      </Svg>
    );
  });
