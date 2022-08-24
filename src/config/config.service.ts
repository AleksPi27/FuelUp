import{TypeOrmModuleOptions} from '@nestjs/typeorm';
require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`Config error: missing env.${key}`);
    }
    return value;
  }

  public ensureValues(keys: string[]){
    keys.forEach(k=>this.getValue(k,true));
    return this;
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
        type: 'postgres',
        host: this.getValue('POSTGRES_HOST'),
        port: parseInt(this.getValue('POSTGRES_PORT')),
        username: this.getValue('POSTGRES_USER'),
        password: this.getValue('POSTGRES_PSWD'),
        database: this.getValue('POSTGRES_DB'),

        entities: ['**/*.entity{.ts,.js}'],
    }
  }
}

export const configService = new ConfigService(process.env)
.ensureValues([
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PSWD',
    'POSTGRES_DB'
])


