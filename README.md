# GestionPro - Sistema de Gestion de Proyectos

Sistema web para la gestion de proyectos y tareas con control de acceso por roles (gerente/usuario), desarrollado con Next.js 16, React 19 y json-server.

## Integrantes del equipo

| Nombres | Apellidos | Carne |
|---------|-----------|-------|
| Diego Guillermo | Esnard Romero | ER231474 |
| Eduardo Ezequiel | Lopez Rivera | LR230061 |
| Diego Rene | Lopez Martinez | LM231893 |
| Christian Gustavo | Crespin Lozano | CL060107 |
| Andres Rene | Velasquez Rodriguez | VR222732 |

## Deploy

| Servicio | URL |
|----------|-----|
| Frontend (Vercel) | https://proyecto1-dps-wine.vercel.app/login |
| API - json-server (Render) | Desplegado en Render (directorio `server/`) |

### Credenciales de prueba

| Rol | Email | Password |
|-----|-------|----------|
| Gerente | usuario@gerente.com | admin123 |
| Usuario | usuario@user.com | admin123 |

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Formularios**: React Hook Form + Zod
- **API mock**: json-server
- **Alertas**: SweetAlert2

## Ejecutar en local

### Requisitos

- Node.js 18+
- npm

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/eduardoezequieel/proyecto1_dps.git
cd proyecto1_dps

# Instalar dependencias
npm install
```

### Ejecutar todo junto (Next.js + json-server)

```bash
npm run dev:full
```

Esto levanta:
- **Next.js** en `http://localhost:3000`
- **json-server** en `http://localhost:3001`

### Ejecutar por separado

```bash
# Terminal 1 - json-server (API)
npm run server

# Terminal 2 - Next.js (Frontend)
npm run dev
```

## Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Inicia Next.js en modo desarrollo |
| `npm run server` | Inicia json-server en puerto 3001 |
| `npm run dev:full` | Inicia ambos servicios en paralelo |
| `npm run build` | Genera el build de produccion |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica tipos con TypeScript |

## Estructura del proyecto

```
proyecto1_dps/
├── app/                    # App Router de Next.js
│   ├── dashboard/          # Paginas protegidas
│   │   ├── my-tasks/       # Mis tareas (rol usuario)
│   │   ├── projects/       # Proyectos (rol gerente)
│   │   ├── tasks/          # Tareas (rol gerente)
│   │   └── users/          # Usuarios (rol gerente)
│   └── login/              # Pagina de login
├── components/             # Componentes reutilizables
│   ├── layout/             # Sidebar, ProtectedRoute
│   ├── projects/           # ProjectModal
│   └── tasks/              # TaskModal, TaskFilterDrawer
├── context/                # AuthContext, ThemeContext
├── hooks/                  # useModal, useProjects, useTasks, useTheme
├── lib/                    # Schemas, constantes, helpers (swal)
├── services/               # Cliente API (axios)
├── server/                 # json-server standalone (para deploy en Render)
│   ├── db.json
│   └── package.json
├── db.json                 # Base de datos local para desarrollo
└── proxy.ts                # Middleware de rutas protegidas
```
