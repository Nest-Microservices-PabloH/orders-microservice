FROM node:21-alpine3.19

# Activar pnpm usando Corepack
RUN corepack enable

# Crear y establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto de tu app
EXPOSE 3003

# Comando por defecto (ajusta según tu app)
CMD [ "pnpm", "run", "start:dev" ]
