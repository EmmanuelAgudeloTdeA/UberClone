const es = {
  common: {
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    save: 'Guardar',
  },
  auth: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    name: 'Nombre completo',
    phone: 'Número de teléfono',
    forgotPassword: '¿Olvidaste tu contraseña?',
    noAccount: '¿No tienes una cuenta?',
    hasAccount: '¿Ya tienes una cuenta?',
  },
  tabs: {
    home: 'Inicio',
    profile: 'Perfil',
  },
  home: {
    greeting: '¿A dónde vas?',
    recentTrips: 'Viajes recientes',
  },
  profile: {
    title: 'Mi perfil',
    editProfile: 'Editar perfil',
    myTrips: 'Mis viajes',
    paymentMethods: 'Métodos de pago',
    settings: 'Configuración',
  },
} as const;

export default es;
