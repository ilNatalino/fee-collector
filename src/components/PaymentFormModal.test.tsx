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

import { PaymentFormModal } from './PaymentFormModal';

function getAmountInput(renderer: ReactTestRenderer) {
  const amountInput = renderer.root.findAll(
    (node) => node.props.placeholder === '0.00' && 'editable' in node.props,
  )[0];

  if (!amountInput) {
    throw new Error('Expected the payment form amount input to be rendered.');
  }

  return amountInput;
}

describe('PaymentFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps submit disabled until the amount is valid and reuses the helper line for validation feedback', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(
        <PaymentFormModal
          visible
          title="Add payment"
          confirmLabel="Add"
          amountHelperText="Remaining quota: €25.00"
          cancelAccessibilityLabel="Cancel add payment"
          confirmAccessibilityLabel="Confirm add payment"
          maxAmountCents={2500}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />,
      );
    });

    const amountInput = getAmountInput(renderer!);
    expect(renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.disabled).toBe(true);
    expect(renderer!.root.findByProps({ children: 'Remaining quota: €25.00' })).toBeTruthy();

    act(() => {
      amountInput.props.onChangeText('30');
    });

    expect(renderer!.root.findByProps({ children: 'Enter an amount up to €25.00' })).toBeTruthy();
    expect(renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.disabled).toBe(true);

    act(() => {
      amountInput.props.onChangeText('12.50');
    });

    expect(renderer!.root.findByProps({ children: 'Remaining quota: €25.00' })).toBeTruthy();
    expect(renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.disabled).toBe(false);

    act(() => {
      renderer!.root.findByProps({ accessibilityLabel: 'Confirm add payment' }).props.onPress();
    });

    expect(onSubmit).toHaveBeenCalledWith({ amountCents: 1250 });
  });

  it('renders the optional description for edit flows', () => {
    let renderer: ReactTestRenderer;

    act(() => {
      renderer = create(
        <PaymentFormModal
          visible
          title="Edit payment"
          description="Recorded for Marco"
          confirmLabel="Save"
          amountHelperText="Maximum amount: €15.00"
          cancelAccessibilityLabel="Cancel edit payment"
          confirmAccessibilityLabel="Confirm edit payment"
          initialAmountCents={500}
          maxAmountCents={1500}
          onCancel={() => undefined}
          onSubmit={() => undefined}
        />,
      );
    });

    expect(renderer!.root.findByProps({ children: 'Recorded for Marco' })).toBeTruthy();
    expect(renderer!.root.findByProps({ children: 'Maximum amount: €15.00' })).toBeTruthy();
  });
});