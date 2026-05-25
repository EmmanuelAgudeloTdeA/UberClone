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
    personalData: 'Datos personales',
    security: 'Seguridad',
    myTrips: 'Mis viajes',
    saveChanges: 'Guardar cambios',
    changePhoto: 'Cambiar foto',
    language: 'Idioma preferido',
    updateSuccess: 'Perfil actualizado exitosamente',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    changePassword: 'Cambiar contraseña',
    passwordUpdated: 'Contraseña actualizada exitosamente',
    noTrips: 'Sin viajes todavía',
    tripsComingSoon: 'Tu historial de viajes aparecerá aquí en la Fase 4.',
  },
} as const;

export default es;
