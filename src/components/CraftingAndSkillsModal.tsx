import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  BASE_STAGES,
  COLORS,
  getWeaponStats,
  SKILL_DEFS,
  WEAPON_DEFS,
} from '../constants/gameData';
import {
  BaseStageId,
  SkillTreeState,
  WeaponId,
  WeaponProgress,
} from '../types/game';
import {
  BaseStageIconSvg,
  SkillIconSvg,
  WeaponIconSvg,
} from './WeaponIconSvg';

interface CraftingAndSkillsModalProps {
  visible: boolean;
  cash: number;
  scrap: number;
  equippedWeaponId: WeaponId;
  weapons: Record<WeaponId, WeaponProgress>;
  skills: SkillTreeState;
  baseStage: BaseStageId;
  turretUpgradeLevel: number;
  hapticsEnabled: boolean;
  onCraftOrEquipWeapon: (weaponId: WeaponId) => void;
  onUpgradeWeapon: (weaponId: WeaponId) => void;
  onUpgradeSkill: (skillKey: keyof SkillTreeState) => void;
  onUpgradeBaseStage: () => void;
  onUpgradeTurrets: () => void;
  onClose: () => void;
}

type TabKey = 'weapons' | 'skills' | 'base';

export const CraftingAndSkillsModal: React.FC<CraftingAndSkillsModalProps> = ({
  visible,
  cash,
  scrap,
  equippedWeaponId,
  weapons,
  skills,
  baseStage,
  turretUpgradeLevel,
  hapticsEnabled,
  onCraftOrEquipWeapon,
  onUpgradeWeapon,
  onUpgradeSkill,
  onUpgradeBaseStage,
  onUpgradeTurrets,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('weapons');

  const triggerTick = () => {
    if (hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const nextBaseStageDef =
    baseStage < 3 ? BASE_STAGES[(baseStage + 1) as BaseStageId] : null;
  const currentBaseDef = BASE_STAGES[baseStage];
  const turretUpgradeCostCash = 140 + turretUpgradeLevel * 95;
  const turretUpgradeCostScrap = 18 + turretUpgradeLevel * 12;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          {/* Top Header & Resources */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>ПОЛИГОН И МАСТЕРСКАЯ</Text>
              <Text style={styles.title}>Арсенал и развитие</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerTick();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>В бой</Text>
            </TouchableOpacity>
          </View>

          {/* Resource Balances */}
          <View style={styles.resourceBar}>
            <View style={styles.resItem}>
              <Text style={styles.resLabel}>МОНЕТЫ</Text>
              <Text style={[styles.resVal, { color: COLORS.accentAmber }]}>
                {cash}
              </Text>
            </View>
            <View style={styles.resDivider} />
            <View style={styles.resItem}>
              <Text style={styles.resLabel}>ДЕТАЛИ ОРУЖИЯ</Text>
              <Text style={[styles.resVal, { color: COLORS.accentCyan }]}>
                {scrap}
              </Text>
            </View>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => {
                triggerTick();
                setActiveTab('weapons');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'weapons' && styles.tabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'weapons' && styles.tabBtnTextActive,
                ]}
              >
                Крафт оружия
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerTick();
                setActiveTab('skills');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'skills' && styles.tabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'skills' && styles.tabBtnTextActive,
                ]}
              >
                Ветки навыков
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerTick();
                setActiveTab('base');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'base' && styles.tabBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'base' && styles.tabBtnTextActive,
                ]}
              >
                Вышка и база
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'weapons' && (
              <View style={styles.listCol}>
                {WEAPON_DEFS.map((wDef) => {
                  const prog = weapons[wDef.id] || { unlocked: false, level: 1 };
                  const stats = getWeaponStats(wDef.id, prog.level);
                  const isEquipped = equippedWeaponId === wDef.id;
                  const parentUnlocked =
                    !wDef.requiresWeaponId ||
                    weapons[wDef.requiresWeaponId]?.unlocked;
                  const canCraft =
                    !prog.unlocked &&
                    parentUnlocked &&
                    cash >= wDef.craftCashCost &&
                    scrap >= wDef.craftScrapCost;
                  const canUpgrade =
                    prog.unlocked &&
                    cash >= stats.upgradeCashCost &&
                    scrap >= stats.upgradeScrapCost;

                  const parentDef = wDef.requiresWeaponId
                    ? WEAPON_DEFS.find((d) => d.id === wDef.requiresWeaponId)
                    : null;

                  return (
                    <View
                      key={wDef.id}
                      style={[
                        styles.itemCard,
                        isEquipped && styles.itemCardEquipped,
                      ]}
                    >
                      <View style={styles.weaponTopRow}>
                        {/* Vector Weapon Illustration Box */}
                        <View
                          style={[
                            styles.weaponIconBox,
                            isEquipped && { borderColor: wDef.color },
                          ]}
                        >
                          <WeaponIconSvg
                            weaponId={wDef.id}
                            width={74}
                            height={36}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.itemHeaderRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemTitle}>{wDef.name}</Text>
                              <Text style={styles.itemSubtitle}>
                                {wDef.category}
                                {prog.unlocked ? ` · Ур. ${prog.level}` : ''}
                              </Text>
                            </View>

                            {prog.unlocked && (
                              <View
                                style={[
                                  styles.statusTag,
                                  isEquipped && styles.statusTagEquipped,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.statusTagText,
                                    isEquipped && { color: '#0D1014' },
                                  ]}
                                >
                                  {isEquipped ? 'В руках' : 'Готово'}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Weapon Technical Specs */}
                          <View style={styles.specsRow}>
                            <Text style={styles.specText}>
                              Урон: {stats.damage}
                              {wDef.pellets > 1 ? `×${wDef.pellets}` : ''}
                            </Text>
                            <Text style={styles.specText}>
                              Темп: {(1000 / stats.fireIntervalMs).toFixed(1)}/с
                            </Text>
                            <Text style={styles.specText}>
                              Пробитие: {wDef.pierce}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.itemDesc}>{wDef.description}</Text>

                      {!prog.unlocked ? (
                        <View style={styles.craftRow}>
                          {!parentUnlocked ? (
                            <Text style={styles.lockedReqText}>
                              Требуется чертеж: {parentDef?.name}
                            </Text>
                          ) : (
                            <TouchableOpacity
                              disabled={!canCraft}
                              onPress={() => onCraftOrEquipWeapon(wDef.id)}
                              style={[
                                styles.actionBtn,
                                canCraft
                                  ? styles.actionBtnReady
                                  : styles.actionBtnDisabled,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.actionBtnText,
                                  canCraft && { color: '#0D1014' },
                                ]}
                              >
                                Скрафтить ({wDef.craftCashCost} мон. ·{' '}
                                {wDef.craftScrapCost} дет.)
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ) : (
                        <View style={styles.unlockedActionsRow}>
                          {!isEquipped && (
                            <TouchableOpacity
                              onPress={() => onCraftOrEquipWeapon(wDef.id)}
                              style={styles.equipSecondaryBtn}
                            >
                              <Text style={styles.equipSecondaryText}>
                                Взять в руки
                              </Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            disabled={!canUpgrade}
                            onPress={() => onUpgradeWeapon(wDef.id)}
                            style={[
                              styles.upgradeWeaponBtn,
                              canUpgrade
                                ? styles.actionBtnReady
                                : styles.actionBtnDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.actionBtnText,
                                canUpgrade && { color: '#0D1014' },
                              ]}
                            >
                              Улучшить ({stats.upgradeCashCost} мон. ·{' '}
                              {stats.upgradeScrapCost} дет.)
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === 'skills' && (
              <View style={styles.listCol}>
                {SKILL_DEFS.map((sk) => {
                  const currLvl = skills[sk.key] || 0;
                  const isMax = currLvl >= sk.maxLevel;
                  const cost = Math.round(sk.baseCost * Math.pow(1.38, currLvl));
                  const canBuy = !isMax && cash >= cost;
                  const pct = Math.min(
                    100,
                    Math.round((currLvl / sk.maxLevel) * 100)
                  );

                  return (
                    <View key={sk.key} style={styles.itemCard}>
                      <View style={styles.skillHeaderRow}>
                        <SkillIconSvg skillKey={sk.key} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{sk.title}</Text>
                          <Text style={styles.itemSubtitle}>{sk.subtitle}</Text>
                        </View>
                        <Text style={styles.skillLevelTag}>
                          {currLvl} / {sk.maxLevel}
                        </Text>
                      </View>

                      <View style={styles.progressBg}>
                        <View
                          style={[styles.progressFill, { width: `${pct}%` }]}
                        />
                      </View>

                      <TouchableOpacity
                        disabled={!canBuy}
                        onPress={() => onUpgradeSkill(sk.key)}
                        style={[
                          styles.actionBtn,
                          canBuy
                            ? styles.actionBtnReady
                            : styles.actionBtnDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionBtnText,
                            canBuy && { color: '#0D1014' },
                          ]}
                        >
                          {isMax
                            ? 'Максимальный уровень'
                            : `Прокачать (${cost} монет)`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === 'base' && (
              <View style={styles.listCol}>
                {/* Current Base Status */}
                <View style={[styles.itemCard, styles.itemCardEquipped]}>
                  <View style={styles.skillHeaderRow}>
                    <BaseStageIconSvg stage={baseStage} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.kicker}>ТЕКУЩИЙ УКРЕПРАЙОН</Text>
                      <Text style={[styles.itemTitle, { marginTop: 2 }]}>
                        {currentBaseDef.title}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        {currentBaseDef.subtitle}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemDesc}>
                    {currentBaseDef.description}
                  </Text>

                  <View style={styles.specsRow}>
                    <Text style={styles.specText}>
                      Безопасный радиус: {currentBaseDef.safeRadius} м
                    </Text>
                    <Text style={styles.specText}>
                      Авто-турели: {currentBaseDef.turretCount} шт.
                    </Text>
                  </View>
                </View>

                {/* Next Base Evolution Stage */}
                {nextBaseStageDef ? (
                  <View style={styles.itemCard}>
                    <View style={styles.skillHeaderRow}>
                      <BaseStageIconSvg stage={nextBaseStageDef.stage} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.kicker}>
                          СЛЕДУЮЩИЙ ЭТАП РАЗВИТИЯ
                        </Text>
                        <Text style={[styles.itemTitle, { marginTop: 2 }]}>
                          {nextBaseStageDef.title}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {nextBaseStageDef.subtitle}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.itemDesc}>
                      {nextBaseStageDef.description}
                    </Text>

                    <TouchableOpacity
                      disabled={
                        cash < nextBaseStageDef.cashCost ||
                        scrap < nextBaseStageDef.scrapCost
                      }
                      onPress={onUpgradeBaseStage}
                      style={[
                        styles.actionBtn,
                        cash >= nextBaseStageDef.cashCost &&
                        scrap >= nextBaseStageDef.scrapCost
                          ? styles.actionBtnReady
                          : styles.actionBtnDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          cash >= nextBaseStageDef.cashCost &&
                            scrap >= nextBaseStageDef.scrapCost && {
                              color: '#0D1014',
                            },
                        ]}
                      >
                        Построить ({nextBaseStageDef.cashCost} мон. ·{' '}
                        {nextBaseStageDef.scrapCost} дет.)
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.itemCard}>
                    <Text style={styles.itemTitle}>
                      Военная деревня полностью возведена
                    </Text>
                    <Text style={styles.itemDesc}>
                      Достигнут максимальный уровень фортификации базы и защитного периметра.
                    </Text>
                  </View>
                )}

                {/* Turret Caliber Upgrade */}
                {baseStage >= 1 && (
                  <View style={styles.itemCard}>
                    <View style={styles.itemHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>
                          Калибр гарнизона и турелей
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          +25% к урону снайпера на вышке и автоматических турелей
                        </Text>
                      </View>
                      <Text style={styles.skillLevelTag}>
                        Ур. {turretUpgradeLevel}
                      </Text>
                    </View>

                    <TouchableOpacity
                      disabled={
                        cash < turretUpgradeCostCash ||
                        scrap < turretUpgradeCostScrap
                      }
                      onPress={onUpgradeTurrets}
                      style={[
                        styles.actionBtn,
                        cash >= turretUpgradeCostCash &&
                        scrap >= turretUpgradeCostScrap
                          ? styles.actionBtnReady
                          : styles.actionBtnDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          cash >= turretUpgradeCostCash &&
                            scrap >= turretUpgradeCostScrap && {
                              color: '#0D1014',
                            },
                        ]}
                      >
                        Усилить гарнизон ({turretUpgradeCostCash} мон. ·{' '}
                        {turretUpgradeCostScrap} дет.)
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 8, 12, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    backgroundColor: '#12151E',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.textPrimary,
  },
  closeBtnText: {
    color: '#0D1014',
    fontSize: 13,
    fontWeight: '600',
  },
  resourceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  resItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 14,
  },
  resLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  resVal: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 11,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  tabBtnTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  scrollArea: {
    flexGrow: 0,
  },
  listCol: {
    gap: 10,
    paddingBottom: 10,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemCardEquipped: {
    borderColor: 'rgba(56, 189, 248, 0.38)',
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
  },
  weaponTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  weaponIconBox: {
    width: 82,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0B0E14',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  statusTagEquipped: {
    backgroundColor: COLORS.accentCyan,
  },
  statusTagText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  itemDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  craftRow: {
    marginTop: 2,
  },
  lockedReqText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  unlockedActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  equipSecondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  upgradeWeaponBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnReady: {
    backgroundColor: COLORS.textPrimary,
  },
  actionBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  skillLevelTag: {
    color: COLORS.accentCyan,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  progressBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentCyan,
  },
});
