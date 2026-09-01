export const colors = {
  forest: '#173F2E', forest2: '#265D3D', leaf: '#4F8A4B', lime: '#A8C66C', cream: '#FBF7EC',
  white: '#FFFFFF', ink: '#18241E', muted: '#6F7B74', line: '#E5E8E1', gold: '#D5A84B',
  orange: '#E88B42', paleGreen: '#EAF3E7', paleGold: '#FFF1D7', red: '#A94E43', paleRed: '#FBEAE7',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, xxxl: 36 };
export const radius = { sm: 9, md: 14, lg: 20, xl: 26, pill: 999 };
export const shadow = { shadowColor: '#133425', shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 } as const;
export const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
