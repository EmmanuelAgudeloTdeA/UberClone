import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string | null;
}

const Input = forwardRef<TextInput, InputProps>(({ label, error, style, ...rest }, ref) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      ref={ref}
      style={[styles.input, error ? styles.inputError : null, style]}
      placeholderTextColor="#888"
      autoCapitalize="none"
      autoCorrect={false}
      {...rest}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
));

Input.displayName = 'Input';

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  error: {
    fontSize: 12,
    color: '#e53e3e',
  },
});
