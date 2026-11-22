import React from 'react';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { BaseStageId, SkillTreeState, WeaponId } from '../types/game';

interface WeaponIconSvgProps {
  weaponId: WeaponId;
  width?: number;
  height?: number;
}

export const WeaponIconSvg: React.FC<WeaponIconSvgProps> = React.memo(
  ({ weaponId, width = 76, height = 38 }) => {
    return (
      <Svg width={width} height={height} viewBox="0 0 80 40">
        {weaponId === 'pistol' && (
          <G>
            {/* Grip */}
            <Polygon
              points="26,20 34,20 30,34 21,34"
              fill="#334155"
              stroke="#94A3B8"
              strokeWidth={1.2}
            />
            {/* Grip Texture */}
            <Polygon points="25,22 31,22 28,32 22,32" fill="#1E293B" />
            {/* Trigger Guard */}
            <Path
              d="M34,20 L41,20 L41,25 L33,25 Z"
              fill="none"
              stroke="#64748B"
              strokeWidth={1.2}
            />
            {/* Slide / Barrel */}
            <Rect
              x={23}
              y={11}
              width={32}
              height={9}
              rx={2}
              fill="#475569"
              stroke="#E2E8F0"
              strokeWidth={1.3}
            />
            <Line x1={27} y1={14} x2={48} y2={14} stroke="#1E293B" strokeWidth={1.5} />
            {/* Muzzle & Sights */}
            <Rect x={55} y={13} width={3} height={5} fill="#94A3B8" />
            <Rect x={25} y={9} width={3} height={2} fill="#F59E0B" />
            <Rect x={51} y={9} width={2} height={2} fill="#F59E0B" />
          </G>
        )}

        {weaponId === 'smg' && (
          <G>
            {/* Folding Stock */}
            <Path
              d="M10,17 L22,17 L22,21 L12,24 L10,24 Z"
              fill="#1E293B"
              stroke="#64748B"
              strokeWidth={1.2}
            />
            {/* Rear Grip */}
            <Polygon
              points="24,21 31,21 28,34 21,34"
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth={1.2}
            />
            {/* Forward Angled Magwell / Extended Mag */}
            <Polygon
              points="42,21 48,21 51,36 45,36"
              fill="#334155"
              stroke="#38BDF8"
              strokeWidth={1.2}
            />
            {/* Upper Receiver */}
            <Rect
              x={22}
              y={11}
              width={34}
              height={11}
              rx={2.5}
              fill="#334155"
              stroke="#E2E8F0"
              strokeWidth={1.3}
            />
            {/* Top Picatinny Rail & Reflex Sight */}
            <Rect x={26} y={9} width={26} height={2} fill="#64748B" />
            <Polygon points="34,5 42,5 43,9 33,9" fill="#0F172A" stroke="#38BDF8" strokeWidth={1.2} />
            {/* Silencer / Barrel */}
            <Rect x={56} y={13.5} width={14} height={5} rx={1.5} fill="#1E293B" stroke="#94A3B8" strokeWidth={1.1} />
          </G>
        )}

        {weaponId === 'shotgun' && (
          <G>
            {/* Heavy Stock */}
            <Polygon
              points="6,23 23,16 23,23 8,31"
              fill="#78350F"
              stroke="#D97706"
              strokeWidth={1.2}
            />
            {/* Receiver */}
            <Rect
              x={23}
              y={13}
              width={22}
              height={9}
              rx={1.5}
              fill="#334155"
              stroke="#E2E8F0"
              strokeWidth={1.3}
            />
            {/* Long Barrel & Underbarrel Tube */}
            <Rect x={45} y={13.5} width={27} height={4} fill="#64748B" stroke="#E2E8F0" strokeWidth={1} />
            <Rect x={45} y={18} width={23} height={3.5} fill="#475569" />
            {/* Wooden / Tactical Pump Handguard */}
            <Rect
              x={48}
              y={17}
              width={15}
              height={6}
              rx={2}
              fill="#92400E"
              stroke="#F59E0B"
              strokeWidth={1.2}
            />
            {/* Ejection Port */}
            <Rect x={30} y={15} width={8} height={3} fill="#EF4444" />
          </G>
        )}

        {weaponId === 'rifle' && (
          <G>
            {/* Tactical Stock */}
            <Polygon
              points="7,15 21,15 21,22 10,27 7,27"
              fill="#1E293B"
              stroke="#64748B"
              strokeWidth={1.2}
            />
            {/* Pistol Grip */}
            <Polygon points="23,22 29,22 26,34 20,34" fill="#1E293B" stroke="#64748B" strokeWidth={1.1} />
            {/* Curved AK Magazine */}
            <Path
              d="M37,22 L44,22 Q47,30 51,35 L44,37 Q40,31 37,22 Z"
              fill="#1E293B"
              stroke="#34D399"
              strokeWidth={1.3}
            />
            {/* Receiver & Handguard */}
            <Rect
              x={21}
              y={12}
              width={25}
              height={10}
              rx={2}
              fill="#334155"
              stroke="#E2E8F0"
              strokeWidth={1.3}
            />
            <Rect
              x={46}
              y={13}
              width={14}
              height={7}
              rx={1.5}
              fill="#1E293B"
              stroke="#34D399"
              strokeWidth={1.1}
            />
            {/* Barrel & Front Sight */}
            <Rect x={60} y={14.5} width={14} height={3.5} fill="#94A3B8" />
            <Polygon points="68,10 71,10 71,15 68,15" fill="#64748B" />
            {/* Optic */}
            <Rect x={27} y={7} width={12} height={5} rx={1.5} fill="#0F172A" stroke="#34D399" strokeWidth={1.2} />
          </G>
        )}

        {weaponId === 'sniper' && (
          <G>
            {/* Precision Skeleton Stock */}
            <Polygon
              points="4,15 20,15 20,22 14,22 9,28 4,28"
              fill="#1E293B"
              stroke="#818CF8"
              strokeWidth={1.2}
            />
            {/* Grip & Box Mag */}
            <Polygon points="21,22 26,22 24,33 19,33" fill="#1E293B" stroke="#64748B" strokeWidth={1} />
            <Rect x={32} y={22} width={8} height={10} rx={1} fill="#334155" stroke="#818CF8" strokeWidth={1.2} />
            {/* Receiver */}
            <Rect x={20} y={13} width={26} height={9} rx={1.5} fill="#334155" stroke="#E2E8F0" strokeWidth={1.3} />
            {/* Long Fluted Barrel & Muzzle Brake */}
            <Rect x={46} y={15} width={26} height={3.5} fill="#94A3B8" />
            <Rect x={72} y={13.5} width={5} height={6.5} rx={1} fill="#475569" stroke="#E2E8F0" strokeWidth={1} />
            {/* Long Sniper Scope */}
            <Line x1={26} y1={13} x2={26} y2={10} stroke="#94A3B8" strokeWidth={2} />
            <Line x1={38} y1={13} x2={38} y2={10} stroke="#94A3B8" strokeWidth={2} />
            <Polygon
              points="21,6 45,5 45,11 21,10"
              fill="#0F172A"
              stroke="#818CF8"
              strokeWidth={1.3}
            />
          </G>
        )}

        {weaponId === 'railgun' && (
          <G>
            {/* Heavy Energy Stock */}
            <Polygon
              points="5,13 21,13 21,25 8,28 5,25"
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth={1.3}
            />
            {/* Core Chamber */}
            <Rect
              x={21}
              y={11}
              width={26}
              height={14}
              rx={3}
              fill="#1E293B"
              stroke="#E2E8F0"
              strokeWidth={1.4}
            />
            {/* Glowing Plasma Coils */}
            <Rect x={26} y={14} width={4} height={8} rx={1} fill="#38BDF8" />
            <Rect x={33} y={14} width={4} height={8} rx={1} fill="#38BDF8" />
            <Rect x={40} y={14} width={4} height={8} rx={1} fill="#38BDF8" />
            {/* Dual Electromagnetic Rails */}
            <Rect x={47} y={12} width={27} height={4} rx={1} fill="#334155" stroke="#38BDF8" strokeWidth={1.2} />
            <Rect x={47} y={20} width={27} height={4} rx={1} fill="#334155" stroke="#38BDF8" strokeWidth={1.2} />
            <Line x1={47} y1={18} x2={75} y2={18} stroke="#7DD3FC" strokeWidth={2} />
          </G>
        )}
      </Svg>
    );
  }
);

export const SkillIconSvg: React.FC<{ skillKey: keyof SkillTreeState }> = React.memo(
  ({ skillKey }) => {
    return (
      <Svg width={36} height={36} viewBox="0 0 36 36">
        <Rect
          x={2}
          y={2}
          width={32}
          height={32}
          rx={9}
          fill="#1E293B"
          stroke="#334155"
          strokeWidth={1.5}
        />
        {skillKey === 'maxHpLevel' && (
          <G>
            <Rect x={15} y={9} width={6} height={18} rx={1.5} fill="#34D399" />
            <Rect x={9} y={15} width={18} height={6} rx={1.5} fill="#34D399" />
          </G>
        )}
        {skillKey === 'armorLevel' && (
          <Polygon
            points="18,7 28,11 26,22 18,29 10,22 8,11"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth={2}
          />
        )}
        {skillKey === 'speedLevel' && (
          <Polygon
            points="13,9 26,18 13,27 16,18"
            fill="#F59E0B"
          />
        )}
        {skillKey === 'critLevel' && (
          <G>
            <Circle cx={18} cy={18} r={8} fill="none" stroke="#EF4444" strokeWidth={2} />
            <Line x1={18} y1={6} x2={18} y2={30} stroke="#EF4444" strokeWidth={1.5} />
            <Line x1={6} y1={18} x2={30} y2={18} stroke="#EF4444" strokeWidth={1.5} />
          </G>
        )}
        {skillKey === 'scavengeLevel' && (
          <G>
            <Polygon points="18,8 27,14 27,24 18,29 9,24 9,14" fill="#F59E0B" stroke="#FDE047" strokeWidth={1.2} />
          </G>
        )}
        {skillKey === 'regenLevel' && (
          <G>
            <Circle cx={18} cy={18} r={9} fill="none" stroke="#34D399" strokeWidth={2} strokeDasharray="5 3" />
            <Circle cx={18} cy={18} r={4} fill="#34D399" />
          </G>
        )}
      </Svg>
    );
  }
);

export const BaseStageIconSvg: React.FC<{ stage: BaseStageId }> = React.memo(
  ({ stage }) => {
    return (
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Rect
          x={2}
          y={2}
          width={44}
          height={44}
          rx={12}
          fill="#1E293B"
          stroke="#334155"
          strokeWidth={1.5}
        />
        {stage === 0 && (
          <G>
            {/* Polygon Target & Sandbags */}
            <Rect x={10} y={28} width={28} height={8} rx={3} fill="#78350F" stroke="#D97706" strokeWidth={1.2} />
            <Circle cx={24} cy={18} r={7} fill="#0F172A" stroke="#EF4444" strokeWidth={2} />
            <Circle cx={24} cy={18} r={2.5} fill="#EF4444" />
          </G>
        )}
        {stage === 1 && (
          <G>
            {/* Watchtower Silhouette */}
            <Line x1={16} y1={38} x2={20} y2={20} stroke="#94A3B8" strokeWidth={2.2} />
            <Line x1={32} y1={38} x2={28} y2={20} stroke="#94A3B8" strokeWidth={2.2} />
            <Line x1={17} y1={30} x2={31} y2={30} stroke="#64748B" strokeWidth={1.8} />
            <Rect x={15} y={13} width={18} height={8} rx={2} fill="#0F172A" stroke="#38BDF8" strokeWidth={1.8} />
            <Polygon points="13,13 24,7 35,13" fill="#38BDF8" />
          </G>
        )}
        {stage >= 2 && (
          <G>
            {/* Fortified Compound & Auto-Turrets */}
            <Rect x={8} y={24} width={32} height={14} rx={2} fill="#334155" stroke="#94A3B8" strokeWidth={1.5} />
            <Rect x={17} y={12} width={14} height={14} rx={2} fill="#0F172A" stroke="#38BDF8" strokeWidth={1.8} />
            <Circle cx={12} cy={21} r={3.5} fill="#F59E0B" />
            <Circle cx={36} cy={21} r={3.5} fill="#F59E0B" />
          </G>
        )}
      </Svg>
    );
  }
);
