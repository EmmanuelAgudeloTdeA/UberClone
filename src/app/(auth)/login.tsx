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
import { loginUser } from '@/services/authService';
import { useAppDispatch } from '@/store';
import { clearAuthError, setAuthError } from '@/store/authSlice';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  // Set header title synchronously before paint
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('auth.login') });
  }, [navigation, t]);

  const isFormValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const validate = useCallback((): boolean => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr ?? undefined, password: passwordErr ?? undefined });
    return !emailErr && !passwordErr;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    dispatch(clearAuthError());
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await loginUser(email, password);
      // AuthContext listener auto-redirects after sign-in
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setSubmitError(message);
      dispatch(setAuthError(message));
    } finally {
      setLoading(false);
    }
  }, [email, password, validate, dispatch]);

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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="user@example.com"
          />

          <Input
            ref={passwordRef}
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            placeholder="••••••••"
          />

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            disabled={!isFormValid}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>
              {t('auth.noAccount')}{' '}
              <Text style={styles.linkBold}>{t('auth.register')}</Text>
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
