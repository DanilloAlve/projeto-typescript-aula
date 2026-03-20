import { jwtConfig } from "../config/jwt.config.js";
import { appDataSource } from "../database/appDataSource.js";
import RefreshToken from "../entities/RefreshToken.js";
import jwt from 'jsonwebtoken'
import { AppError } from "../errors/AppError.js";

export default class LogoutService {

    private repoRefresh = appDataSource.getRepository(RefreshToken);

        async logout(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, jwtConfig.refresh.secret) as any;
            await this.repoRefresh.update(
                { jti: decoded.jti },
                { revoked: true }
            );
        } catch {
            throw new AppError(400, "Token inválido para logout");
        }
        }

        async logoutAll(userId: string) {
        await this.repoRefresh.update(
            { pesquisador: { id: userId } },
            { revoked: true }
        );
        }

}
