const request = require('supertest');
const app = require('../server');

describe('Testes de Integração e Sistema (API)', () => {

  it('CT-01: Deve retornar status 200 na rota raiz de Health Check', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.message).toContain('rodando com sucesso');
  });

  describe('Segurança e Autenticação', () => {
    it('CT-02: Deve rejeitar tentativas de login com payload vazio (Erro 400 ou 500)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('CT-03: Deve rejeitar formato de e-mail inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nao-sou-um-email', password: '123' });
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
    
    it('CT-04: Rota protegida sem JWT deve retornar erro 401 Unauthorized', async () => {
      const response = await request(app).get('/api/dashboard/kpis');
      expect(response.status).toBe(401);
    });
  });

});
