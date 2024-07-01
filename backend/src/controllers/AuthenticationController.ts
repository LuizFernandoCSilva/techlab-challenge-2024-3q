import { Request, Response } from "express";
import { database } from "../services/database.js";
import { User } from "../entities/User.js";
import jwt from 'jsonwebtoken';
import { APP_NAME, SECRET } from "../constants/env.js";
import { profiles } from "../constants/profiles.js";
import bcrypt from 'bcrypt'; // Importando biblioteca para hashing de senha

export class AuthenticationController {
  /**
   * POST /auth/sign-in
   */
  public async signIn(req: Request, res: Response) {
    if (typeof req.body !== 'object') throw new Error('Bad Request: body is required');

    if (typeof req.body.username !== 'string') throw new Error('Bad Request: body.username is required');

    if (typeof req.body.password !== 'string') throw new Error('Bad Request: body.password is required');

    const repository = database.getRepository(User);

    const user = await repository.findOneBy([
      { email: req.body.username },
      { username: req.body.username }
    ]);

    if (!user) throw new Error('User not found');

    // Verificando a senha através do bcrypt(hash)
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) throw new Error('Invalid password');

    // Define o tipo de perfil explicitamente
    type ProfileType = 'sudo' | 'standard';

    // Verifique se o perfil do usuário é válido
    if (!['sudo', 'standard'].includes(user.profile)) {
      throw new Error('Invalid profile');
    }

    const profile = profiles[user.profile as ProfileType];

    const scopes = profile.scopes(user);

    const accessToken = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        { scopes: Array.isArray(scopes) ? scopes : [scopes] },
        SECRET,
        {
          audience: APP_NAME,
          issuer: APP_NAME,
          expiresIn: '1h',
          subject: `user:${user.id}`
        },
        (err, token) => {
          if (err) return reject(err);

          if (!token) return reject(new Error('Failed to generate token'));

          resolve(token);
        }
      );
    });

    res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 3600 });
  }
}
