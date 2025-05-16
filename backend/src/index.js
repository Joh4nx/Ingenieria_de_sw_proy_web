// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');               // ← Import de bcrypt

// Importar la conexión a Firebase
const db = require('./firebase/firebase');

// Configuración de Multer con memoryStorage para usar Sharp
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes.'), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

/* -------------------------- Endpoints para Menú -------------------------- */

// POST /menu - Agregar un nuevo plato (con posibilidad de subir imagen o usar URL)
app.post('/menu', upload.single('imagen'), async (req, res) => {
  try {
    const nuevoPlato = { ...req.body };

    if (req.file) {
      const bufferComprimido = await sharp(req.file.buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
      nuevoPlato.imagen = `data:image/jpeg;base64,${bufferComprimido.toString('base64')}`;
    } else if (nuevoPlato.imagenUrl) {
      nuevoPlato.imagen = nuevoPlato.imagenUrl;
    }

    if (!nuevoPlato.nombre || !nuevoPlato.precio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio).' });
    }

    const platoRef = db.ref('platos').push();
    await platoRef.set(nuevoPlato);
    res.status(201).json({ mensaje: 'Plato agregado con éxito', id: platoRef.key });
  } catch (error) {
    console.error('Error al agregar plato:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /menu - Obtener todos los platos del menú
app.get('/menu', (req, res) => {
  db.ref('platos').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      res.json(data || {});
    })
    .catch(error => res.status(500).json({ error: error.message }));
});

// PUT /menu/:id - Actualizar un plato
app.put('/menu/:id', upload.single('imagen'), async (req, res) => {
  try {
    const id = req.params.id;
    let datosActualizados = { ...req.body };

    if (req.file) {
      const bufferComprimido = await sharp(req.file.buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
      datosActualizados.imagen = `data:image/jpeg;base64,${bufferComprimido.toString('base64')}`;
    } else if (datosActualizados.imagenUrl) {
      datosActualizados.imagen = datosActualizados.imagenUrl;
    }

    if (!datosActualizados.nombre || !datosActualizados.precio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio).' });
    }

    await db.ref(`platos/${id}`).update(datosActualizados);
    res.status(200).json({ mensaje: 'Plato actualizado con éxito', id });
  } catch (error) {
    console.error('Error al actualizar plato:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /menu/:id - Eliminar un plato
app.delete('/menu/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.ref(`platos/${id}`).remove();
    res.status(200).json({ mensaje: 'Plato eliminado con éxito', id });
  } catch (error) {
    console.error('Error al eliminar plato:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------- Endpoints para Reservas ------------------------ */

// POST /reservas - Guardar una nueva reserva
app.post('/reservas', (req, res) => {
  const { nombre, fecha, hora, personas, correo, createdAt } = req.body;
  if (!nombre || !fecha || !hora || !personas || !correo || !createdAt) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, fecha, hora, personas, correo, createdAt).' });
  }
  const reservaRef = db.ref('reservas').push();
  reservaRef.set({ nombre, fecha, hora, personas, correo, createdAt })
    .then(() => res.status(201).json({ mensaje: 'Reserva guardada con éxito', id: reservaRef.key }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// GET /reservas - Obtener todas las reservas
app.get('/reservas', (req, res) => {
  db.ref('reservas').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      res.json(data || {});
    })
    .catch(error => res.status(500).json({ error: error.message }));
});

/* --------- Endpoints para Registro e Inicio de Sesión de Usuarios --------- */

// POST /usuarios - Registrar un nuevo usuario con contraseña cifrada
app.post('/usuarios', async (req, res) => {
  const { nombre, email, password, role } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, email, password).' });
  }

  try {
    // Verificar si ya existe el email
    const snapshot = await db.ref('usuarios')
      .orderByChild('email')
      .equalTo(email)
      .once('value');

    if (snapshot.exists()) {
      const existingUser = Object.values(snapshot.val())[0];
      return res.status(200).json({ mensaje: 'Usuario ya registrado', usuario: existingUser });
    }

    // Hashear la contraseña antes de guardar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = {
      nombre,
      email,
      password: hashedPassword,       // ← guardamos el hash, no el texto plano
      role: role || 'cliente'
    };

    const usuarioRef = db.ref('usuarios').push();
    await usuarioRef.set(nuevoUsuario);
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: usuarioRef.key });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /login - Iniciar sesión comparando hashes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (email, password).' });
  }

  try {
    const snapshot = await db.ref('usuarios')
      .orderByChild('email')
      .equalTo(email)
      .once('value');

    const data = snapshot.val();
    if (!data) {
      return res.status(400).json({ error: 'Usuario no encontrado.' });
    }

    const usuarioId = Object.keys(data)[0];
    const usuario = data[usuarioId];

    // Comparar contraseña con el hash almacenado
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(400).json({ error: 'Contraseña incorrecta.' });
    }

    // Éxito: devolvemos datos públicos del usuario
    return res.status(200).json({
      usuario: {
        id: usuarioId,
        email: usuario.email,
        role: usuario.role,
        nombre: usuario.nombre
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------- Inicio del Servidor ------------------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor backend corriendo en el puerto ${PORT}`));
