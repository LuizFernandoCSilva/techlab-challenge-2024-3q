export const APP_NAME = 'TechLab Challenge 2024 3q Backend';

const appPortEnv = process.env.APP_PORT;

if (!appPortEnv) {
  throw new Error('APP_PORT must be defined');
}

const parsedAppPort = parseInt(appPortEnv, 10);

if (!Number.isInteger(parsedAppPort)) {
  throw new TypeError('APP_PORT must be an integer');
}

export const APP_PORT = parsedAppPort;

if (!process.env.SECRET) {
  throw new Error('SECRET must be defined');
}

export const SECRET = process.env.SECRET;
