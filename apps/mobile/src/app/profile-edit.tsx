import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/profile/Avatar';
import { ProviderIcon, providerLabel } from '@/components/profile/ProviderIcon';
import { Brand, BrandFonts } from '@/constants/theme';
import { fetchMe, updateMe, type Me } from '@/data/member';
import { uploadProfileImage } from '@/data/profileImage';
import { validateNickname } from '@/utils/nickname';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
};

/** 프로필 편집 — 사진(시트에서 고르기)과 닉네임을 바꾼다. 사진은 고르는 즉시 저장되고, 닉네임은 "완료"를 눌러야 저장된다. */
export default function ProfileEditScreen() {
  const [me, setMe] = useState<Me | null>(null);
  // null = 아직 안 건드림(서버에서 받은 닉네임을 그대로 보여준다)
  const [nick, setNick] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const original = me?.nickname ?? '';
  const value = nick ?? original;
  const changed = value !== original;
  const check = validateNickname(value);
  // 건드리지 않은 상태(원래 닉네임 그대로)에서는 검증 색을 띄우지 않고 기본 안내만 보여준다.
  const showCheck = changed || nick !== null;
  const canSave = changed && check.ok && !busy;

  const handleSave = async () => {
    setBusy(true);
    const outcome = await updateMe({ nickname: value });
    setBusy(false);
    if (outcome.ok) {
      router.back();
    } else {
      Alert.alert('저장하지 못했어요', outcome.message);
    }
  };

  // 사진을 고르거나 찍어서 바로 올린다. 시트를 먼저 닫아야 카메라/사진첩 화면과 겹치지 않는다.
  const handlePick = async (source: 'camera' | 'library') => {
    setSheetOpen(false);
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('카메라 권한이 필요해요', '설정에서 카메라 접근을 허용해 주세요.');
        return;
      }
    }
    const picked =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (picked.canceled) return;

    setBusy(true);
    const outcome = await uploadProfileImage(picked.assets[0].uri);
    setBusy(false);
    if (outcome.ok) {
      setMe((prev) => (prev ? { ...prev, profileImageUrl: outcome.imageUrl } : prev));
    } else {
      Alert.alert('사진을 바꾸지 못했어요', outcome.message);
    }
  };

  const handleReset = async () => {
    setSheetOpen(false);
    setBusy(true);
    const outcome = await updateMe({ profileImageKey: '' });
    setBusy(false);
    if (outcome.ok) {
      setMe(outcome.me);
    } else {
      Alert.alert('사진을 바꾸지 못했어요', outcome.message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton} hitSlop={8}>
          <Text style={styles.headerAction}>취소</Text>
        </Pressable>
        <Text style={styles.headerTitle}>프로필 편집</Text>
        <Pressable onPress={handleSave} disabled={!canSave} style={styles.headerButton} hitSlop={8}>
          <Text style={[styles.headerAction, styles.headerDone, !canSave && styles.headerDisabled]}>완료</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setSheetOpen(true)}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="프로필 사진 변경"
        style={styles.avatarArea}>
        <Avatar size={104} imageUrl={me?.profileImageUrl} />
        {busy ? <ActivityIndicator color={Brand.primary} /> : <Text style={styles.avatarEdit}>사진 편집</Text>}
      </Pressable>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>닉네임</Text>
        <View
          style={[
            styles.inputBox,
            showCheck && changed && (check.ok ? styles.inputBoxOk : styles.inputBoxBad),
          ]}>
          <TextInput
            value={value}
            onChangeText={setNick}
            maxLength={12}
            placeholder="닉네임"
            placeholderTextColor="#8A8FA3"
            style={styles.input}
          />
          <Text style={styles.count}>{Array.from(value).length}/12</Text>
        </View>
        <Text style={[styles.help, { color: showCheck && changed ? check.helpColor : Brand.muted }]}>
          {showCheck && changed ? check.help : '한글, 영문, 숫자로 2~12자'}
        </Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>연결된 계정</Text>
        {(me?.providers.length ? me.providers : [null]).map((provider) => (
          <View key={provider ?? 'none'} style={styles.accountCard}>
            <ProviderIcon provider={provider} size={30} />
            <View style={styles.accountText}>
              <Text style={styles.accountName}>{providerLabel(provider)}</Text>
              <Text style={styles.accountEmail}>{me?.email ?? ''}</Text>
            </View>
            <Text style={styles.accountStatus}>연결됨</Text>
          </View>
        ))}
      </View>

      {sheetOpen && (
        <>
          <Pressable accessibilityLabel="닫기" onPress={() => setSheetOpen(false)} style={styles.overlay} />
          <View accessibilityViewIsModal style={styles.sheet}>
            <View style={styles.sheetCard}>
              <Text style={[styles.sheetTitle, styles.sheetDivider]}>프로필 사진</Text>
              <SheetAction label="사진 찍기" onPress={() => handlePick('camera')} />
              <SheetAction label="앨범에서 선택" onPress={() => handlePick('library')} />
              <SheetAction label="기본 이미지로 변경" color="#C73A31" onPress={handleReset} last />
            </View>
            <View style={styles.sheetCard}>
              <SheetAction label="취소" color={Brand.muted} onPress={() => setSheetOpen(false)} last />
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function SheetAction({
  label,
  onPress,
  color = Brand.primaryDark,
  last,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.sheetAction, !last && styles.sheetDivider]}>
      <Text style={[styles.sheetActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  headerAction: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 17,
    color: Brand.primary,
  },
  headerDone: {
    textAlign: 'right',
    fontFamily: BrandFonts.gothicBold,
  },
  headerDisabled: {
    color: '#C7C7CC',
  },
  headerTitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 17,
    color: Brand.ink,
  },
  avatarArea: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  avatarEdit: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 16,
    color: Brand.primary,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    paddingHorizontal: 16,
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    color: Brand.muted,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  inputBoxOk: {
    borderColor: '#34C759',
  },
  inputBoxBad: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 17,
    color: Brand.ink,
  },
  count: {
    fontFamily: BrandFonts.soraSemiBold,
    fontSize: 15,
    color: '#8A8FA3',
  },
  help: {
    paddingHorizontal: 16,
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  accountText: {
    flex: 1,
    gap: 1,
  },
  accountName: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 16,
    color: Brand.ink,
  },
  accountEmail: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    color: Brand.muted,
  },
  accountStatus: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 15,
    color: Brand.muted,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,22,48,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    gap: 10,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sheetTitle: {
    paddingVertical: 14,
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
  sheetDivider: {
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  sheetAction: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetActionText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
  },
});
