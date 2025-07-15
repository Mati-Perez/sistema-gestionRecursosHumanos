import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const AUTO_ADMIN_EMAIL = "lucasjb77@gmail.com";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Buscar usuario ignorando mayúsculas en el email
  let usuario = await prisma.usuario.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: { cliente: true },
  });

  // Si no existe y el email coincide con el auto-admin → lo creamos
  if (!usuario && email.toLowerCase() === AUTO_ADMIN_EMAIL.toLowerCase()) {
    const hashed = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: AUTO_ADMIN_EMAIL,
        nombre: "Lucas",
        password: hashed,
        rol: "ADMIN",
      },
    });

    usuario = {
      ...nuevoUsuario,
      cliente: null, // ⬅️ evitamos el error de tipo
    };

    console.log("✅ Administrador creado automáticamente");
  }

  // Validar credenciales
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    return NextResponse.json(
      { mensaje: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  // Generar token
  const token = jwt.sign(
    {
      sub: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
      email: usuario.email,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '2h' }
  );

  // Construir respuesta
  const response = NextResponse.json(
    {
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.cliente?.apellido,
        dni: usuario.cliente?.dni,
        rol: usuario.rol,
        email: usuario.email,
      },
      token,
    },
    { status: 200 }
  );

  // Setear cookie
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 horas
  });

  return response;
}
