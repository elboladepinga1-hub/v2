import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions'; // 👈 Importar Functions

const firebaseConfig = {
  apiKey: 'AIzaSyAOGDqjKHDZ9T_4stYWN2aW2I4shcJRQEg',
  authDomain: 'wild-pictures-studio-contratos.firebaseapp.com',
  projectId: 'wild-pictures-studio-contratos',
  storageBucket: 'wild-pictures-studio-contratos.appspot.com',
  messagingSenderId: '1045086853975',
  appId: '1:1045086853975:web:70e0a13ceeb2485cd13c12'
};

// ✅ Inicializar Firebase de forma segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); // 👈 Exportar Functions
export const firebaseProjectId = firebaseConfig.projectId;

export default app;
