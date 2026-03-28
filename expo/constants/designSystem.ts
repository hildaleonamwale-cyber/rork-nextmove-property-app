export const DesignSystem = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 48,
  },
  
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 36,
    giant: 48,
  },
  
  propertyCard: {
    shadow: {
      shadowColor: '#43C2D1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    borderRadius: 20,
    imageHeight: 220,
    padding: 20,
    maxWidth: '100%' as const,
  },
  
  card: {
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    borderRadius: 16,
    padding: 18,
  },
  
  glassmorphism: {
    shadow: {
      shadowColor: '#43C2D1',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 16,
    },
    borderRadius: 24,
    borderWidth: 1,
  },
  
  header: {
    height: 64,
    paddingHorizontal: 20,
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  
  button: {
    primary: {
      paddingVertical: 18,
      paddingHorizontal: 28,
      borderRadius: 16,
      shadow: {
        shadowColor: '#43C2D1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
    },
    secondary: {
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 14,
      shadow: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
    },
    small: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
    },
  },
  
  input: {
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1.5,
  },
  
  contentPadding: 20,
  
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};
