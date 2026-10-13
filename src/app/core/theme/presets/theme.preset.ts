import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const CashlyPreset = definePreset(Aura, {
  primitive: {
    borderRadius: { xs: '6px', sm: '10px', md: '16px', lg: '24px', xl: '32px' },
  },
  semantic: {
    focusRing: { width: '2px', style: 'solid', color: '{primary.color}', offset: '3px' },
    colorScheme: {
      light: {
        primary: {
          color: '#171717',
          inverseColor: '#ffffff',
          hoverColor: '#333333',
          activeColor: '#000000',
        },
        surface: {
          0: '#ffffff',
          50: '#f5f5f3',
          100: '#ebebe8',
          200: '#deded9',
          300: '#c5c5bf',
          400: '#91918a',
          500: '#707069',
          600: '#54544e',
          700: '#393935',
          800: '#252522',
          900: '#171715',
          950: '#0b0b0a',
        },
      },
      dark: {
        primary: {
          color: '#f5f5f3',
          inverseColor: '#171717',
          hoverColor: '#deded9',
          activeColor: '#c5c5bf',
        },
        surface: {
          0: '#ffffff',
          50: '#f5f5f3',
          100: '#ebebe8',
          200: '#deded9',
          300: '#c5c5bf',
          400: '#91918a',
          500: '#707069',
          600: '#54544e',
          700: '#393935',
          800: '#252522',
          900: '#171715',
          950: '#0b0b0a',
        },
      },
    },
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
  },
  components: {
    button: { root: { borderRadius: '999px', paddingX: '1.25rem', paddingY: '0.7rem' } },
    inputtext: { root: { borderRadius: '12px', paddingX: '1rem', paddingY: '0.8rem' } },
    select: { root: { borderRadius: '12px' } },
    dialog: { root: { borderRadius: '28px' } },
    popover: { root: { borderRadius: '20px' } },
    datatable: { headerCell: { padding: '1rem' }, bodyCell: { padding: '1rem' } },
  },
});
