import { Platform } from 'react-native';

export const colors = {
  forest: '#174E2A',
  forestDark: '#0D3520',
  leaf: '#2F7D3E',
  leafLight: '#DDEEDC',
  mint: '#F0F7EE',
  cream: '#FFF9EC',
  warmWhite: '#FFFCF6',
  saffron: '#D9A52E',
  saffronLight: '#FFF1C9',
  brown: '#6A3710',
  ink: '#17201A',
  muted: '#68736B',
  line: '#E3E8E2',
  white: '#FFFFFF',
  danger: '#C93E36',
  dangerLight: '#FDECEA',
  success: '#1D7A45',
  successLight: '#E6F5EC',
  info: '#2766B1',
  infoLight: '#EAF2FD',
  overlay: 'rgba(7, 34, 18, 0.52)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const radius = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 };

export const shadow = Platform.select({
  ios: {
    shadowColor: '#102417',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
  },
  android: { elevation: 4 },
  default: { boxShadow: '0 7px 18px rgba(16,36,23,0.09)' },
});

export const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
