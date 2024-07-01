import { Request, Response } from "express";
import { User } from "../entities/User.js";
import { database } from "../services/database.js";
import { FindOneOptions } from "typeorm"; // Importe o tipo FindOneOptions do TypeORM

export class UsersController {
  protected get repository() {
    return database.getRepository(User);
  }

  /**
   * GET /users/:userId
   * Retorna um usuário específico pelo ID.
   */
  public async findOne(req: Request<{ userId: string }>, res: Response) {
    const userId = req.params.userId;
    const options: FindOneOptions<User> = {
      where: { id: userId },
      relations: ["posts", "comments"], // Exemplo de opções adicionais
    };

    try {
      const user = await this.repository.findOne(options);

      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
  }

  /**
   * PATCH /users/:userId
   * Atualiza um usuário existente pelo ID.
   * Retorna o usuário atualizado.
   * Trata erros de validação ou falha na atualização.
   */
  public async update(req: Request<{ userId: string }>, res: Response) {
    const userId = req.params.userId;
    const options: FindOneOptions<User> = {
      where: { id: userId },
      relations: ["posts", "comments"], // Exemplo de opções adicionais
    };

    try {
      const user = await this.repository.findOne(options);

      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      // Atualiza apenas as propriedades do usuário que foram enviadas no corpo da requisição
      this.repository.merge(user, req.body);
      const updatedUser = await this.repository.save(user);

      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update user", error: error.message });
    }
  }


  /**
   * DELETE /users/:userId
   * Remove logicamente um usuário pelo ID.
   * Retorna o usuário removido.
   * Trata erros de validação ou falha na remoção.
   */
  public async delete(req: Request<{ userId: string }>, res: Response) {
    const userId = req.params.userId;
    const options: FindOneOptions<User> = {
      where: { id: userId },
      relations: ["posts", "comments"], // Exemplo de opções adicionais
    };

    try {
      const user = await this.repository.findOne(options);

      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      await this.repository.softRemove(user);

      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to delete user", error: error.message });
    }
  }
}
