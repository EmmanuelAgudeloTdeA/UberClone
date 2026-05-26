import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { changeUserPassword } from '@/services/profileService';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

export default function SecurityTab() {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [success, setSuccess] = useState(false);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const isFormValid = useMemo(
    () => currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0,
    [currentPassword, newPassword, confirmPassword],
  );

  const handleChange = useCallback(async () => {
    const newErr = validatePassword(newPassword) ?? undefined;
    const confirmErr = validateConfirmPassword(newPassword, confirmPassword) ?? undefined;
    const currentErr = currentPassword.trim() === '' ? t('profile.passwordRequired') : undefined;

    if (currentErr || newErr || confirmErr) {
      setErrors({ current: currentErr, new: newErr, confirm: confirmErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('profile.passwordChangeFailed');
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

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
        <Input
          label={t('profile.currentPassword')}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          error={errors.current}
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current?.focus()}
          placeholder="••••••••"
        />

        <Input
          ref={newPasswordRef}
          label={t('profile.newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
          error={errors.new}
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
          error={errors.confirm}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleChange}
          placeholder="••••••••"
        />

        {success ? <Text style={styles.success}>{t('profile.passwordUpdated')}</Text> : null}

        <Button
          title={t('profile.changePassword')}
          onPress={handleChange}
          loading={loading}
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
  success: {
    fontSize: 13,
    color: '#22c55e',
    textAlign: 'center',
  },
});
