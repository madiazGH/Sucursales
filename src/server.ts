import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import mysql from 'mysql2/promise';

// Conexión a la base de datos bd_proyecto_p2
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_proyecto_p2',
});

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// API - Clientes
app.get('/api/clientes', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cliente');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.post('/api/clientes', async (req, res): Promise<void> => {
  try {
    const { nombre, apellido, situacionFiscal, dni } = req.body;
    if (!nombre || !apellido || !dni) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }
    const [result]: any = await db.query(
      'INSERT INTO cliente (nombre, apellido, situacionFiscal, dni) VALUES (?, ?, ?, ?)',
      [nombre, apellido, situacionFiscal || 'Consumidor Final', dni]
    );
    res.json({ idCliente: result.insertId, nombre, apellido, situacionFiscal, dni });
  } catch (error) {
    console.error('Error al agregar cliente:', error);
    res.status(500).json({ error: 'Error al agregar cliente' });
  }
});

app.delete('/api/clientes/:id', async (req, res): Promise<void> => {
  try {
    await db.query('DELETE FROM cliente WHERE idCliente = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente (puede tener facturas asociadas)' });
  }
});

// API - Sucursales
app.get('/api/sucursales', async (_req, res): Promise<void> => {
  try {
    const [rows] = await db.query('SELECT * FROM sucursal');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sucursales' });
  }
});

app.post('/api/sucursales', async (req, res): Promise<void> => {
  try {
    const { nombre, ciudad, direccion, cantempleado } = req.body;
    if (!nombre || !ciudad || !direccion) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }
    const [result]: any = await db.query(
      'INSERT INTO sucursal (nombre, ciudad, direccion, cantempleado) VALUES (?, ?, ?, ?)',
      [nombre, ciudad, direccion, cantempleado || 0]
    );
    res.json({ idSucursal: result.insertId, nombre, ciudad, direccion, cantempleado });
  } catch (error) {
    console.error('Error al agregar sucursal:', error);
    res.status(500).json({ error: 'Error al agregar sucursal' });
  }
});

app.delete('/api/sucursales/:id', async (req, res): Promise<void> => {
  try {
    await db.query('DELETE FROM sucursal WHERE idSucursal = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    res.status(500).json({ error: 'Error al eliminar sucursal' });
  }
});

// API - Auth (Login)
app.post('/api/login', async (req, res): Promise<void> => {
  try {
    const { usuario, password } = req.body;
    const [rows]: any = await db.query(
      'SELECT idUsuario, usuario, nombre, rol FROM usuarios WHERE usuario = ? AND password = ?',
      [usuario, password]
    );
    if (rows.length === 0) {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al autenticar:', error);
    res.status(500).json({ error: 'Error de servidor o tabla usuarios no creada' });
  }
});

// API - Usuarios (Solo empleados para admin)
app.get('/api/usuarios', async (_req, res): Promise<void> => {
  try {
    const [rows] = await db.query('SELECT idUsuario, usuario, nombre, rol FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/usuarios', async (req, res): Promise<void> => {
  try {
    const { usuario, password, nombre, rol } = req.body;
    if (!usuario || !password || !nombre) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }
    const rolAsignado = rol === 'Admin' ? 'Admin' : 'Empleado';
    const [result]: any = await db.query(
      'INSERT INTO usuarios (usuario, password, nombre, rol) VALUES (?, ?, ?, ?)',
      [usuario, password, nombre, rolAsignado]
    );
    res.json({ idUsuario: result.insertId, usuario, nombre, rol: rolAsignado });
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res.status(500).json({ error: 'Error al agregar usuario o usuario ya existente' });
  }
});

app.delete('/api/usuarios/:id', async (req, res): Promise<void> => {
  try {
    const [user]: any = await db.query('SELECT rol FROM usuarios WHERE idUsuario = ?', [req.params.id]);
    if (user.length > 0 && user[0].rol === 'Admin') {
      res.status(400).json({ error: 'No se puede eliminar el usuario Admin' });
      return;
    }
    await db.query('DELETE FROM usuarios WHERE idUsuario = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
