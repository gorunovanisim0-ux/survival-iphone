import React from 'react';
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/gameData';
import { GameSettings } from '../types/game';

interface PauseSettingsModalProps {
  visible: boolean;
  wave: number;
  cash: number;
  scrap: number;
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onResume: () => void;
  onSaveAndExitToMenu: () => void;
}

export const PauseSettingsModal: React.FC<PauseSettingsModalProps> = ({
  visible,
  wave,
  cash,
  scrap,
  settings,
  onUpdateSettings,
  onResume,
  onSaveAndExitToMenu,
}) => {
  const toggleSetting = (key: keyof GameSettings, value: boolean | number) => {
    if (settings.hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>ПАУЗА И НАСТРОЙКИ</Text>
          <Text style={styles.title}>Тактическое меню</Text>
          <Text style={styles.statusSub}>
            Волна {wave} · Монеты: {cash} · Детали: {scrap}
          </Text>

          <View style={styles.settingsBlock}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingTitle}>Виброотклик Taptic Engine</Text>
                <Text style={styles.settingDesc}>
                  Тактильная отдача при стрельбе и попаданиях
                </Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(v) => toggleSetting('hapticsEnabled', v)}
                trackColor={{ false: '#27272A', true: COLORS.accentCyan }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingTitle}>Гироскоп (обзор и камера)</Text>
                <Text style={styles.settingDesc}>
                  Плавное смещение камеры при наклоне iPhone
                </Text>
              </View>
              <Switch
                value={settings.gyroEnabled}
                onValueChange={(v) => toggleSetting('gyroEnabled', v)}
                trackColor={{ false: '#27272A', true: COLORS.accentCyan }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingTitle}>Индикаторы урона</Text>
                <Text style={styles.settingDesc}>
                  Показывать цифры нанесённого урона над целями
                </Text>
              </View>
              <Switch
                value={settings.showDamageNumbers}
                onValueChange={(v) => toggleSetting('showDamageNumbers', v)}
                trackColor={{ false: '#27272A', true: COLORS.accentCyan }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.sensitivityCol}>
              <Text style={styles.settingTitle}>Чувствительность джойстика</Text>
              <View style={styles.sensBtnsRow}>
                {[
                  { label: 'Плавная', val: 0.8 },
                  { label: 'Стандарт', val: 1.0 },
                  { label: 'Быстрая', val: 1.25 },
                ].map((opt) => {
                  const active =
                    Math.abs(settings.joystickSensitivity - opt.val) < 0.05;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      onPress={() =>
                        toggleSetting('joystickSensitivity', opt.val)
                      }
                      style={[
                        styles.sensPill,
                        active && styles.sensPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sensPillText,
                          active && { color: COLORS.textPrimary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onResume}
            style={styles.resumeBtn}
          >
            <Text style={styles.resumeBtnText}>Продолжить игру</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSaveAndExitToMenu}
            style={styles.exitBtn}
          >
            <Text style={styles.exitBtnText}>
              Сохранить прогресс и выйти в меню
            </Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 365,
    backgroundColor: '#12151E',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  statusSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  settingsBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  sensitivityCol: {
    paddingTop: 2,
  },
  sensBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  sensPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
  },
  sensPillActive: {
    borderColor: COLORS.accentCyan,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  sensPillText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  resumeBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    marginBottom: 10,
  },
  resumeBtnText: {
    color: '#0D1014',
    fontSize: 14,
    fontWeight: '600',
  },
  exitBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
  },
  exitBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
