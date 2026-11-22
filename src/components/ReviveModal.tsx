import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../constants/gameData';

interface ReviveModalProps {
  visible: boolean;
  currentWave: number;
  cash: number;
  onRevive: (cost: number, targetWave: number) => void;
}

export const ReviveModal: React.FC<ReviveModalProps> = ({
  visible,
  currentWave,
  cash,
  onRevive,
}) => {
  const targetWave = Math.max(1, currentWave - 1);
  const reviveCost = Math.min(cash, Math.max(0, Math.min(45, Math.round(cash * 0.15))));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>КРИТИЧЕСКОЕ РАНЕНИЕ</Text>
          <Text style={styles.title}>Эвакуация на полигон</Text>
          <Text style={styles.desc}>
            Вы потеряли сознание под натиском волны {currentWave}. Всё ваше оружие, ветки развития и постройки базы полностью сохранены.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Рубеж возврата</Text>
              <Text style={styles.infoValue}>Волна {targetWave}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Стоимость эвакуации</Text>
              <Text style={[styles.infoValue, { color: COLORS.accentAmber }]}>
                {reviveCost > 0 ? `${reviveCost} монет` : 'Бесплатно'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onRevive(reviveCost, targetWave)}
            style={styles.reviveBtn}
          >
            <Text style={styles.reviveBtnText}>
              Воскреснуть на волне {targetWave}
              {reviveCost > 0 ? ` (−${reviveCost} мон.)` : ''}
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
    backgroundColor: 'rgba(10, 6, 8, 0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 355,
    backgroundColor: '#14131A',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.32)',
    alignItems: 'center',
  },
  kicker: {
    color: COLORS.accentRed,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  infoBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  reviveBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
  },
  reviveBtnText: {
    color: '#0D1014',
    fontSize: 14,
    fontWeight: '600',
  },
});
