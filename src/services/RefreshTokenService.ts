import bcrypt from "bcryptjs";
import { jwtConfig } from "../config/jwt.config.js";
import { appDataSource } from "../database/appDataSource.js";
import type Pesquisador from "../entities/Pesquisador.js";
import RefreshToken from "../entities/RefreshToken.js";
import { randomUUID } from "crypto";
import jwt from 'jsonwebtoken'
import ms from 'ms'
import { AppError } from "../errors/AppError.js";

export default class RefreshTokenService {

    private repoRefresh = appDataSource.getRepository(RefreshToken);

async refresh(refreshToken: string, userAgent: string, ip: string) {

  const decoded = jwt.verify(
    refreshToken,
    jwtConfig.refresh.secret
  ) as any;

  const tokenDb = await this.repoRefresh.findOne({
    where: {
      jti: decoded.jti,
      revoked: false,
      userAgent,
      ipAddress: ip
    },
    relations: ['pesquisador']
  });

  if (!tokenDb || tokenDb.expireIn < new Date()) {
    throw new AppError(401, "Token inválido");
  }

  const valid = await bcrypt.compare(refreshToken, tokenDb.tokenhash);
  if (!valid) {
    throw new AppError(401, "Token inválido");
  }

  await this.repoRefresh.update({ id: tokenDb.id }, { revoked: true });

  const novo = await this.repoRefresh.save({
    jti: randomUUID(),
    sessionId: tokenDb.sessionId,
    userAgent,
    ipAddress: ip,
    pesquisador: tokenDb.pesquisador
  });

  return {
    tokenAccess: this.generateAcessToken(tokenDb.pesquisador),
    tokenRefresh: await this.generateRefreshToken(
      tokenDb.pesquisador,
      novo.jti
    )
  };
}
    
    private async generateRefreshToken(pesq: Pesquisador, jti: string) {
    
            const tokenPlan = jwt.sign(
                {
                    sub: pesq.id,
                    jti: jti,
                    type: 'refresh'
                },
                jwtConfig.refresh.secret,
                {
                    expiresIn: jwtConfig.refresh.expiresIn!
                }
            );
    
    
            const expireInMS = typeof jwtConfig.refresh.expiresIn === "string" ?
             ms(jwtConfig.refresh.expiresIn) : jwtConfig.refresh.expiresIn! * 1000;
    
             await this.repoRefresh.update({ jti }, {
                tokenhash: await bcrypt.hash(tokenPlan, 12),
                expireIn: new Date(Date.now() + expireInMS ),
                revoked: false
             })
    
             return tokenPlan;
        }
    
    private generateAcessToken(pesquisador: Pesquisador) {
            return jwt.sign(
                {
                    sub: pesquisador.id,
                    email: pesquisador.email,
                    type: "access"
                },
                jwtConfig.access.secret,
                {
                    expiresIn: jwtConfig.access.expiresIn!
                }
            )
        }

}
