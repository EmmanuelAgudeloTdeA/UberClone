import { useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
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
import { useNavigation } from 'expo-router';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { registerUser } from '@/services/authService';
import { useAppDispatch } from '@/store';
import { clearAuthError, setAuthError } from '@/store/authSlice';
import type { Gender, Language } from '@/types/user';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from '@/utils/validation';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

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

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('prefer_not_to_say');
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Refs for keyboard tab-through
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Set header title synchronously before paint
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('auth.register') });
  }, [navigation, t]);

  const isFormValid = useMemo(
    () =>
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      phone.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0,
    [fullName, email, phone, password, confirmPassword],
  );

  const validate = useCallback((): boolean => {
    const nextErrors: FormErrors = {
      fullName: validateFullName(fullName) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: validatePhone(phone) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword: validateConfirmPassword(password, confirmPassword) ?? undefined,
    };
    setErrors(nextErrors);
    return Object.values(nextErrors).every(v => v === undefined);
  }, [fullName, email, phone, password, confirmPassword]);

  const handleRegister = useCallback(async () => {
    dispatch(clearAuthError());
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser({ fullName, email, phone, password, gender, language });
      // AuthContext listener auto-redirects after registration
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setSubmitError(message);
      dispatch(setAuthError(message));
    } finally {
      setLoading(false);
    }
  }, [fullName, email, phone, password, gender, language, validate, dispatch]);

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
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start riding with UberClone</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.name')}
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            placeholder="John Doe"
          />

          <Input
            ref={emailRef}
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            placeholder="user@example.com"
          />

          <Input
            ref={phoneRef}
            label={t('auth.phone')}
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="3001234567"
          />

          <Input
            ref={passwordRef}
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            placeholder="••••••••"
          />

          <Input
            ref={confirmPasswordRef}
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            placeholder="••••••••"
          />

          {/* Gender picker */}
          <View style={styles.pickerGroup}>
            <Text style={styles.pickerLabel}>Gender</Text>
            <View style={styles.optionRow}>
              {GENDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    gender === option.value && styles.optionSelected,
                  ]}
                  onPress={() => setGender(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language picker */}
          <View style={styles.pickerGroup}>
            <Text style={styles.pickerLabel}>Preferred Language</Text>
            <View style={styles.optionRow}>
              {LANGUAGE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    language === option.value && styles.optionSelected,
                  ]}
                  onPress={() => setLanguage(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      language === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            loading={loading}
            disabled={!isFormValid}
          />

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>
              {t('auth.hasAccount')}{' '}
              <Text style={styles.linkBold}>{t('auth.login')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    gap: 40,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  form: {
    gap: 20,
  },
  pickerGroup: {
    gap: 8,
  },
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
  submitError: {
    fontSize: 13,
    color: '#e53e3e',
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
  linkBold: {
    color: '#fff',
    fontWeight: '700',
  },
});
