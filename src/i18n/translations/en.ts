const en = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
  },
  auth: {
    login: 'Log In',
    register: 'Register',
    logout: 'Log Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone Number',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
  },
  tabs: {
    home: 'Home',
    profile: 'Profile',
  },
  home: {
    greeting: 'Where to?',
    recentTrips: 'Recent Trips',
  },
  profile: {
    title: 'My Profile',
    editProfile: 'Edit Profile',
    myTrips: 'My Trips',
    paymentMethods: 'Payment Methods',
    settings: 'Settings',
  },
} as const;

export default en;
