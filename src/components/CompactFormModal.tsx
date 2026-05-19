import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { ReactNode } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TextInputProps,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

type CompactFormModalProps = Readonly<{
  visible: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  cancelAccessibilityLabel: string;
  confirmAccessibilityLabel: string;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
}>;

type CompactFormFieldProps = Readonly<{
  label: string;
  helperText?: string;
  helperTone?: 'default' | 'error';
  children: ReactNode;
}>;

type CompactFormTextInputProps = TextInputProps & {
  disabled?: boolean;
  inputClassName?: string;
};

type CompactFormPickerSurfaceProps = Readonly<{
  disabled?: boolean;
  children: ReactNode;
}>;

export function CompactFormModal({
  visible,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel,
  cancelAccessibilityLabel,
  confirmAccessibilityLabel,
  confirmDisabled = false,
  onCancel,
  onConfirm,
  children,
}: CompactFormModalProps) {
  const handleBackdropPress = () => {
    Keyboard.dismiss();
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View className="flex-1 justify-center px-[18px] bg-black/30">
            <TouchableWithoutFeedback onPress={() => undefined}>
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 200 }}
              >
                <View className="rounded-3xl bg-white p-6 shadow-lg shadow-zinc-950/10 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
                  <View className="gap-y-1.5">
                    <Text className="text-[19px] font-bold text-zinc-900 dark:text-zinc-100">{title}</Text>
                    {description ? (
                      <Text className="text-sm leading-5 text-zinc-500 dark:text-zinc-400">{description}</Text>
                    ) : null}
                  </View>

                  <View className="mt-6 gap-y-4">{children}</View>

                  <View className="mt-6 flex-row justify-end gap-x-3">
                    <Pressable
                      onPress={onCancel}
                      className="rounded-xl bg-zinc-100 px-5 py-2.5 dark:bg-zinc-800"
                      accessibilityRole="button"
                      accessibilityLabel={cancelAccessibilityLabel}
                    >
                      <Text className="text-[16px] font-semibold text-zinc-700 dark:text-zinc-300">{cancelLabel}</Text>
                    </Pressable>

                    <Pressable
                      onPress={onConfirm}
                      disabled={confirmDisabled}
                      className={`rounded-xl px-5 py-2.5 ${confirmDisabled ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-indigo-500 dark:bg-indigo-400'}`}
                      accessibilityRole="button"
                      accessibilityLabel={confirmAccessibilityLabel}
                    >
                      <Text className={`text-[16px] font-bold ${confirmDisabled ? 'text-zinc-400 dark:text-zinc-500' : 'text-white'}`}>
                        {confirmLabel}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </MotiView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function CompactFormField({
  label,
  helperText,
  helperTone = 'default',
  children,
}: CompactFormFieldProps) {
  return (
    <View className="gap-y-2">
      <Text className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{label}</Text>
      {children}
      {helperText ? (
        <Text
          className={`text-xs leading-5 ${helperTone === 'error' ? 'text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

export function CompactFormTextInput({
  disabled = false,
  inputClassName,
  ...props
}: CompactFormTextInputProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TextInput
      editable={!disabled}
      placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
      className={`rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-[16px] text-zinc-900 dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:text-zinc-100 ${disabled ? 'text-zinc-400 dark:text-zinc-500' : ''} ${inputClassName ?? ''}`}
      {...props}
    />
  );
}

export function CompactFormPickerSurface({
  disabled = false,
  children,
}: CompactFormPickerSurfaceProps) {
  return (
    <View className={`min-h-[52px] justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-900/50 ${disabled ? 'opacity-60' : ''}`}>
      {children}
    </View>
  );
}