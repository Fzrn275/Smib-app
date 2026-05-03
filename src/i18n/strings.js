// src/i18n/strings.js
// English and Bahasa Malaysia strings for the S-MIB app.

export const strings = {
  en: {
    signIn: 'Sign In', signingIn: 'Signing in…',
    createAccount: 'Create Account', welcomeBack: 'Welcome back',
    email: 'Email', password: 'Password',
    confirmPassword: 'Confirm Password', fullName: 'Full Name',
    gradeLevel: 'Grade / Form Level', schoolName: 'School Name',
    organisation: 'Organisation (optional)', focusArea: 'Focus Area (optional)',
    learner: 'Learner', creator: 'Creator', parent: 'Parent',
    signOut: 'Sign Out', language: 'Language',
    privacySecurity: 'Privacy & Security', deleteAccount: 'Delete Account',
    achievements: 'Achievements', leaderboard: 'Leaderboard',
    notifications: 'Notifications', noProjectsFound: 'No projects found',
    loadingDashboard: 'Loading your dashboard…',
    loadingProjects: 'Loading projects…', loading: 'Loading…',
    forgotPassword: 'Forgot password?', register: 'Register',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    chooseYourRole: 'Choose your role', stepOf: 'Step',
    yourDetails: 'Your details',
    termsAgreement: 'I agree to the Terms & Conditions and Privacy Policy',
    continueBtn: 'Continue →', welcomeToSmib: 'Welcome to S-MIB!',
    startExploring: 'Start Exploring →',
  },
  bm: {
    signIn: 'Log Masuk', signingIn: 'Sedang log masuk…',
    createAccount: 'Daftar Akaun', welcomeBack: 'Selamat kembali',
    email: 'E-mel', password: 'Kata laluan',
    confirmPassword: 'Sahkan kata laluan', fullName: 'Nama penuh',
    gradeLevel: 'Tahun / Tingkatan', schoolName: 'Nama sekolah',
    organisation: 'Organisasi (pilihan)', focusArea: 'Bidang fokus (pilihan)',
    learner: 'Pelajar', creator: 'Pencipta', parent: 'Ibu bapa',
    signOut: 'Log Keluar', language: 'Bahasa',
    privacySecurity: 'Privasi & Keselamatan', deleteAccount: 'Padam Akaun',
    achievements: 'Pencapaian', leaderboard: 'Papan Pendahulu',
    notifications: 'Pemberitahuan', noProjectsFound: 'Tiada projek dijumpai',
    loadingDashboard: 'Memuatkan papan pemuka…',
    loadingProjects: 'Memuatkan projek…', loading: 'Memuatkan…',
    forgotPassword: 'Lupa kata laluan?', register: 'Daftar',
    alreadyHaveAccount: 'Sudah ada akaun?',
    dontHaveAccount: 'Belum ada akaun?',
    chooseYourRole: 'Pilih peranan anda', stepOf: 'Langkah',
    yourDetails: 'Maklumat anda',
    termsAgreement: 'Saya bersetuju dengan Terma & Syarat dan Dasar Privasi',
    continueBtn: 'Teruskan →', welcomeToSmib: 'Selamat datang ke S-MIB!',
    startExploring: 'Mula Meneroka →',
  },
};

export function t(lang, key) {
  return strings[lang]?.[key] ?? strings.en[key] ?? key;
}
