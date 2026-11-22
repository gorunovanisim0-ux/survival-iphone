import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  BASE_STAGES,
  COLORS,
  WEAPON_DEFS,
} from '../constants/gameData';
import { BaseStageId, WeaponId } from '../types/game';
import { SurvivorSvg } from './WorldEntitiesSvg';
import { BaseStageIconSvg, WeaponIconSvg } from './WeaponIconSvg';

interface MainMenuOverlayProps {
  visible: boolean;
  hasActiveSave: boolean;
  wave: number;
  cash: number;
  scrap: number;
  totalKills: number;
  equippedWeaponId: WeaponId;
  baseStage: BaseStageId;
  armorLevel: number;
  hapticsEnabled: boolean;
  onContinueGame: () => void;
  onNewGame: () => void;
  onOpenSettings: () => void;
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({
  visible,
  hasActiveSave,
  wave,
  cash,
  scrap,
  totalKills,
  equippedWeaponId,
  baseStage,
  armorLevel,
  hapticsEnabled,
  onContinueGame,
  onNewGame,
  onOpenSettings,
}) => {
  if (!visible) return null;

  const weaponDef =
    WEAPON_DEFS.find((w) => w.id === equippedWeaponId) || WEAPON_DEFS[0];
  const baseDef = BASE_STAGES[baseStage] || BASE_STAGES[0];

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>ТАКТИЧЕСКАЯ ОБОРОНА И ПОЛИГОН</Text>
        <Text style={styles.title}>РУБЕЖ ВЫЖИВАНИЯ</Text>
        <Text style={styles.subtitle}>
          Держите оборону против волн заражённых, создавайте оружие и укрепляйте военную базу
        </Text>

        {/* 2.5D Character & Weapon Preview Showcase */}
        <View style={styles.showcaseRow}>
          <View style={styles.characterBox}>
            <SurvivorSvg
              aimAngleDeg={0}
              walkPhase={0}
              isMoving={false}
              isFiring={false}
              weaponId={equippedWeaponId}
              armorLevel={armorLevel}
            />
          </View>

          <View style={styles.loadoutCol}>
            <View style={styles.loadoutWeaponBox}>
              <WeaponIconSvg
                weaponId={equippedWeaponId}
                width={78}
                height={38}
              />
              <Text style={styles.loadoutWeaponName}>{weaponDef.name}</Text>
            </View>

            <View style={styles.loadoutBaseRow}>
              <BaseStageIconSvg stage={baseStage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.loadoutBaseLabel}>УКРЕПРАЙОН</Text>
                <Text style={styles.loadoutBaseName} numberOfLines={1}>
                  {baseDef.title}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Saved Progress Summary Card */}
        <View style={styles.saveCard}>
          <View style={styles.saveHeaderRow}>
            <Text style={styles.saveBadge}>СОХРАНЁННЫЙ ПРОГРЕСС</Text>
            <Text style={styles.saveWaveTag}>Волна {wave}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Ресурсы</Text>
              <Text style={styles.statValue}>
                {cash} мон. · {scrap} дет.
              </Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>Ликвидировано целей</Text>
              <Text style={styles.statValue}>{totalKills}</Text>
            </View>
          </View>
        </View>

        {/* Primary Action: Continue */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            triggerHaptic();
            onContinueGame();
          }}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>
            {hasActiveSave || wave > 1
              ? `Продолжить (Волна ${wave})`
              : 'Выйти на полигон'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Actions Row */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              triggerHaptic();
              onOpenSettings();
            }}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>Настройки</Text>
          </TouchableOpacity>

          {(hasActiveSave || wave > 1 || cash > 100) && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                triggerHaptic();
                onNewGame();
              }}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Новая игра</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 10, 14, 0.84)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 50,
  },
  panel: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#12151E',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  showcaseRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  characterBox: {
    width: 96,
    height: 108,
    borderRadius: 16,
    backgroundColor: '#0B0E14',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadoutCol: {
    flex: 1,
    gap: 8,
  },
  loadoutWeaponBox: {
    borderRadius: 12,
    backgroundColor: '#0B0E14',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  loadoutWeaponName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  loadoutBaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 6,
  },
  loadoutBaseLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  loadoutBaseName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  saveCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  saveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBadge: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  saveWaveTag: {
    color: COLORS.accentAmber,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statsGrid: {
    gap: 6,
  },
  statCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#0D1014',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
