import * as ImagePicker from 'expo-image-picker';
import i18n from 'i18next';
import { useCallback, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserProfile, updateUserProfile } from '@/services/profileService';
import { uploadProfilePhoto } from '@/services/storageService';
import { useAppDispatch, useAppSelector } from '@/store';
import { setProfile } from '@/store/profileSlice';
import type { Gender, Language } from '@/types/user';
import { validateFullName, validatePhone } from '@/utils/validation';

// ─── Reducer ─────────────────────────────────────────────────────────────────

interface FormState {
  fullName: string;
  phone: string;
  gender: Gender;
  language: Language;
  photoURL: string;
  errors: { fullName?: string; phone?: string };
  isSaving: boolean;
  saveSuccess: boolean;
}

type FormAction =
  | { type: 'INIT'; fullName: string; phone: string; gender: Gender; language: Language; photoURL: string }
  | { type: 'SET_FULL_NAME'; value: string }
  | { type: 'SET_PHONE'; value: string }
  | { type: 'SET_GENDER'; value: Gender }
  | { type: 'SET_LANGUAGE'; value: Language }
  | { type: 'SET_PHOTO_URL'; value: string }
  | { type: 'SET_ERRORS'; errors: FormState['errors'] }
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'SET_SUCCESS'; value: boolean };

const initialFormState: FormState = {
  fullName: '',
  phone: '',
  gender: 'prefer_not_to_say',
  language: 'en',
  photoURL: '',
  errors: {},
  isSaving: false,
  saveSuccess: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        fullName: action.fullName,
        phone: action.phone,
        gender: action.gender,
        language: action.language,
        photoURL: action.photoURL,
        errors: {},
        saveSuccess: false,
      };
    case 'SET_FULL_NAME':
      return { ...state, fullName: action.value, errors: { ...state.errors, fullName: undefined } };
    case 'SET_PHONE':
      return { ...state, phone: action.value, errors: { ...state.errors, phone: undefined } };
    case 'SET_GENDER':
      return { ...state, gender: action.value };
    case 'SET_LANGUAGE':
      return { ...state, language: action.value };
    case 'SET_PHOTO_URL':
      return { ...state, photoURL: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_SAVING':
      return { ...state, isSaving: action.value, saveSuccess: false };
    case 'SET_SUCCESS':
      return { ...state, saveSuccess: action.value, isSaving: false };
    default:
      return state;
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PersonalDataTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = useAppSelector(state => state.profile.data);
  const dispatch = useAppDispatch();

  const [formState, formDispatch] = useReducer(formReducer, initialFormState);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const phoneRef = useRef<TextInput>(null);

  // Populate form fields synchronously when profile loads — prevents empty-field flash
  useLayoutEffect(() => {
    if (profile) {
      formDispatch({
        type: 'INIT',
        fullName: profile.fullName,
        phone: profile.phone,
        gender: profile.gender,
        language: profile.language,
        photoURL: profile.photoURL,
      });
    }
  }, [profile]);

  const displayPhotoUri = pendingPhotoUri ?? (formState.photoURL || null);

  const isFormValid = useMemo(
    () => formState.fullName.trim().length > 0 && formState.phone.trim().length > 0,
    [formState.fullName, formState.phone],
  );

  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPendingPhotoUri(result.assets[0].uri);
    }
  }, []);

  const validate = useCallback((): boolean => {
    const errors = {
      fullName: validateFullName(formState.fullName) ?? undefined,
      phone: validatePhone(formState.phone) ?? undefined,
    };
    formDispatch({ type: 'SET_ERRORS', errors });
    return !errors.fullName && !errors.phone;
  }, [formState.fullName, formState.phone]);

  const handleSave = useCallback(async () => {
    if (!validate() || !user) return;

    formDispatch({ type: 'SET_SAVING', value: true });

    try {
      let { photoURL } = formState;

      if (pendingPhotoUri) {
        setPhotoUploading(true);
        photoURL = await uploadProfilePhoto(user.uid, pendingPhotoUri);
        setPhotoUploading(false);
        setPendingPhotoUri(null);
      }

      await updateUserProfile(user.uid, {
        fullName: formState.fullName.trim(),
        phone: formState.phone.trim(),
        gender: formState.gender,
        language: formState.language,
        photoURL,
      });

      if (formState.language !== profile?.language) {
        await i18n.changeLanguage(formState.language);
      }

      // Re-fetch to keep Redux in sync
      const updated = await fetchUserProfile(user.uid);
      dispatch(setProfile(updated));

      formDispatch({ type: 'SET_PHOTO_URL', value: photoURL });
      formDispatch({ type: 'SET_SUCCESS', value: true });
      setTimeout(() => formDispatch({ type: 'SET_SUCCESS', value: false }), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      Alert.alert('Error', message);
      setPhotoUploading(false);
      formDispatch({ type: 'SET_SAVING', value: false });
    }
  }, [formState, pendingPhotoUri, validate, user, profile, dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile photo */}
        <View style={styles.avatarSection}>
          <Avatar
            uri={displayPhotoUri}
            name={formState.fullName || profile?.fullName}
            size={96}
            uploading={photoUploading}
            onPress={handlePickPhoto}
          />
          <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
        </View>

        {/* Read-only email */}
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>{t('auth.email')}</Text>
          <Text style={styles.readOnlyValue}>{user?.email ?? '—'}</Text>
          <Text style={styles.readOnlyHint}>Contact support to change your email.</Text>
        </View>

        {/* Full name — max 50 chars */}
        <Input
          label={t('auth.name')}
          value={formState.fullName}
          onChangeText={v => formDispatch({ type: 'SET_FULL_NAME', value: v.slice(0, 50) })}
          error={formState.errors.fullName}
          maxLength={50}
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          placeholder="John Doe"
        />

        {/* Phone — numeric only */}
        <Input
          ref={phoneRef}
          label={t('auth.phone')}
          value={formState.phone}
          onChangeText={v => formDispatch({ type: 'SET_PHONE', value: v.replace(/\D/g, '') })}
          error={formState.errors.phone}
          keyboardType="phone-pad"
          returnKeyType="done"
          placeholder="3001234567"
        />

        {/* Gender */}
        <View style={styles.pickerGroup}>
          <Text style={styles.pickerLabel}>Gender</Text>
          <View style={styles.optionRow}>
            {GENDER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, formState.gender === opt.value && styles.optionSelected]}
                onPress={() => formDispatch({ type: 'SET_GENDER', value: opt.value })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formState.gender === opt.value && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language — immediately switches UI */}
        <View style={styles.pickerGroup}>
          <Text style={styles.pickerLabel}>{t('profile.language')}</Text>
          <View style={styles.optionRow}>
            {LANGUAGE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, formState.language === opt.value && styles.optionSelected]}
                onPress={() => formDispatch({ type: 'SET_LANGUAGE', value: opt.value })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formState.language === opt.value && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {formState.saveSuccess ? (
          <Text style={styles.successMsg}>{t('profile.updateSuccess')}</Text>
        ) : null}

        <Button
          title={t('profile.saveChanges')}
          onPress={handleSave}
          loading={formState.isSaving || photoUploading}
          disabled={!isFormValid}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  container: {
    padding: 24,
    gap: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 13,
    color: '#888',
  },
  readOnlyField: {
    gap: 4,
  },
  readOnlyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readOnlyValue: {
    fontSize: 16,
    color: '#aaa',
    paddingVertical: 4,
  },
  readOnlyHint: {
    fontSize: 11,
    color: '#555',
  },
  pickerGroup: { gap: 8 },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  optionSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  optionText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  successMsg: {
    fontSize: 13,
    color: '#22c55e',
    textAlign: 'center',
  },
});
