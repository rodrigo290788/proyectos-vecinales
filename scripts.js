import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const navMenu = document.getElementById('nav-menu');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  
  hamburgerBtn.addEventListener('click', () => {
    if (navMenu.style.display === 'none' || navMenu.style.display === '') {
      navMenu.style.display= 'block';
    } else {
      navMenu.style.display = 'none';
    }
  });
});
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCms4IqlJdqFkl1-OXlu8XbJNTDfeF38f0",
  authDomain: "proyectos-centros-vecinales.firebaseapp.com",
  projectId: "proyectos-centros-vecinales",
  storageBucket: "proyectos-centros-vecinales.appspot.com",
  messagingSenderId: "424700729070",
  appId: "1:424700729070:web:66340e7a828da5230d45ff",
  measurementId: "G-4L1YEX946E"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore(app);

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const formProyecto = document.getElementById('form-proyecto');
const proyectosSection = document.getElementById('proponer-proyecto');
let currentUser = null;

// Manejar inicio de sesión
loginBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    proyectosSection.style.display = 'block';
  } catch (error) {
    console.error("Error al iniciar sesión: ", error);
  }
});

// Manejar cierre de sesión
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    currentUser = null;
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    proyectosSection.style.display = 'none';
  } catch (error) {
    console.error("Error al cerrar sesión: ", error);
  }
});

// Agregar proyecto
formProyecto.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;

  try {
    await addDoc(collection(db, "proyectos"), {
      titulo,
      descripcion,
      votos: 0,
      usuario: currentUser.displayName,
      votantes: []
    });
    formProyecto.reset();
  } catch (error) {
    console.error("Error al agregar proyecto: ", error);
  }
});

// Mostrar proyectos y manejar votaciones
onSnapshot(collection(db, "proyectos"), (snapshot) => {
  const listaProyectos = document.getElementById('lista-proyectos');
  listaProyectos.innerHTML = '';
  snapshot.forEach(doc => {
    const proyecto = doc.data();
    const item = document.createElement('li');
    item.innerHTML = `
      <h3>${proyecto.titulo}</h3>
      <p>${proyecto.descripcion}</p>
      <p>Propuesto por: ${proyecto.usuario}</p>
      <button onclick="votarProyecto('${doc.id}')">Votar</button>
      <span id="votos-${doc.id}">Votos: ${proyecto.votos}</span>
    `;
    listaProyectos.appendChild(item);
  });
});

// Función para votar por un proyecto
async function votarProyecto(proyectoId) {
  const proyectoRef = doc(db, "proyectos", proyectoId);
  const proyectoSnap = await getDoc(proyectoRef);
  const proyecto = proyectoSnap.data();

  if (proyecto.votantes.includes(currentUser.uid)) {
    alert("Ya has votado por este proyecto.");
    return;
  }

  try {
    await updateDoc(proyectoRef, {
      votos: proyecto.votos + 1,
      votantes: arrayUnion(currentUser.uid)
    });
  } catch (error) {
    console.error("Error al votar por el proyecto: ", error);
  }
}

window.votarProyecto = votarProyecto;
