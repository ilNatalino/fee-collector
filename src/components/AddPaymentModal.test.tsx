import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('react-native', async () => {
  const React = await import('react');
  const createHost = (type: string) => ({ children, ...props }: any) => React.createElement(type, props, children);

  return {
    Keyboard: {
      dismiss: () => undefined,
    },
    KeyboardAvoidingView: createHost('keyboard-avoiding-view'),
    Modal: createHost('modal'),
    Platform: {
      OS: 'ios',
    },
    Pressable: createHost('pressable'),
    Text: createHost('text'),
    TextInput: (props: any) => React.createElement('text-input', props),
    TouchableWithoutFeedback: createHost('touchable-without-feedback'),
    View: createHost('view'),
  };
});

vi.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

vi.mock('moti', async () => {
  const React = await import('react');

  return {
    MotiView: ({ children, ...props }: any) => React.createElement('moti-view', props, children),
  };
});

vi.mock('@react-native-picker/picker', async () => {
  const React = await import('react');

  const Picker = ({ children, ...props }: any) => React.createElement('picker', props, children);
  Picker.Item = (props: any) => React.createElement('picker-item', props);

  return { Picker };
});

import { AddPaymentModal } from './AddPaymentModal';

function getAmountInput(renderer: ReactTestRenderer) {
  const amountInput = renderer.root.findAll(
    (node) => node.props.placeholder === '0.00' && 'editable' in node.props,
  )[0];

  if (!amountInput) {
    throw new Error('Expected the add payment amount input to be rendered.');
  }

  return amountInput;
}

const MEMBERS = [
  {
    membershipId: 'm-1',
    memberFullName: 'Marco Rossi',
    remainingAmountCents: 2500,
  },
  {
    membershipId: 'm-2',
    memberFullName: 'Lucia Bianchi',
    remainingAmountCents: 1000,
  },
];

describe('AddPaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts without a selected member and enables the amount field only after selection', () => {
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(
        <AddPaymentModal
          visible
          members={MEMBERS}
          onCancel={() => undefined}
          onSubmit={() => undefined}
        />,
      );
    });

    const amountInput = getAmountInput(renderer!);
    const picker = renderer!.root.findByProps({ prompt: 'Select a member' });

    expect(picker.props.selectedValue).toBe('');
    expect(amountInput.props.editable).toBe(false);
    expect(renderer!.root.findByProps({ children: 'Select a member to enable amount input.' })).toBeTruthy();
    expect(renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.disabled).toBe(true);

    act(() => {
      picker.props.onValueChange('m-1');
    });

    const enabledAmountInput = getAmountInput(renderer!);
    expect(enabledAmountInput.props.editable).toBe(true);
    expect(renderer!.root.findByProps({ children: 'Remaining quota: €25.00' })).toBeTruthy();
  });

  it('clears the amount when changing to a member with a lower remaining amount', () => {
    const onSubmit = vi.fn();
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(
        <AddPaymentModal
          visible
          members={MEMBERS}
          onCancel={() => undefined}
          onSubmit={onSubmit}
        />,
      );
    });

    const picker = renderer!.root.findByProps({ prompt: 'Select a member' });

    act(() => {
      picker.props.onValueChange('m-1');
    });

    const amountInput = getAmountInput(renderer!);

    act(() => {
      amountInput.props.onChangeText('15.00');
    });

    expect(renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.disabled).toBe(false);

    act(() => {
      picker.props.onValueChange('m-2');
    });

    const clearedAmountInput = getAmountInput(renderer!);
    expect(clearedAmountInput.props.value).toBe('');
    expect(renderer!.root.findByProps({ children: 'Remaining quota: €10.00' })).toBeTruthy();
    expect(renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.disabled).toBe(true);

    act(() => {
      clearedAmountInput.props.onChangeText('8.50');
    });

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.onPress();
    });

    expect(onSubmit).toHaveBeenCalledWith('m-2', 850);
  });
});