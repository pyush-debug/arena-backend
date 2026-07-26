import { Controller, Get } from '@nestjs/common';
import * as http from 'http';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ip')
  async getIp() {
    return new Promise((resolve) => {
      http.get('http://api.ipify.org', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve({ ip: data }); });
      }).on('error', (err) => {
        resolve({ error: err.message });
      });
    });
  }
}
