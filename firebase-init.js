const firebaseConfig = {
  apiKey: "AIzaSyA7IX_1heNLZbsMBiVjweTlW6m8_tbZNuU",
  authDomain: "lucasbabearia.firebaseapp.com",
  projectId: "lucasbabearia",
  storageBucket: "lucasbabearia.firebasestorage.app",
  messagingSenderId: "538723471306",
  appId: "1:538723471306:web:4862df2a269edeb7270933",
  measurementId: "G-4TBW5G66NV"
};

window.lucasFirebase = { ready: false };

try {
  firebase.initializeApp(firebaseConfig);
  window.lucasFirebase = {
    ready: true,
    app: firebase.app(),
    auth: firebase.auth(),
    db: firebase.firestore(),
    storage: firebase.storage(),
    analytics: firebase.analytics()
  };
} catch (error) {
  console.warn("Firebase não inicializado:", error);
}
