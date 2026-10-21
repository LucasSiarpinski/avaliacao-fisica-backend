const test = require('node:test');
const { describe, it } = test;
const assert = require('node:assert/strict');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Garante que JWT_SECRET exista para o carregamento do middleware
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-12345';
}

const { adminOnly } = require('../middlewares/authMiddleware');

describe('Testes de Unidade - authMiddleware.js (Backend)', () => {

  describe('adminOnly(req, res, next)', () => {
    it('deve invocar next() quando req.user.role for "ADMIN"', () => {
      let nextCalled = false;
      const req = { user: { id: 1, role: 'ADMIN' } };
      const res = {};
      const next = () => {
        nextCalled = true;
      };

      adminOnly(req, res, next);
      assert.equal(nextCalled, true);
    });

    it('deve retornar status 403 quando req.user.role for "PROFESSOR"', () => {
      let nextCalled = false;
      let statusCode = null;
      let responseBody = null;

      const req = { user: { id: 2, role: 'PROFESSOR' } };
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          responseBody = body;
          return this;
        },
      };
      const next = () => {
        nextCalled = true;
      };

      adminOnly(req, res, next);
      assert.equal(nextCalled, false);
      assert.equal(statusCode, 403);
      assert.deepEqual(responseBody, {
        error: 'Acesso negado. Rota exclusiva para administradores.',
      });
    });

    it('deve retornar status 403 quando req.user não existir', () => {
      let nextCalled = false;
      let statusCode = null;

      const req = {};
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json() {
          return this;
        },
      };
      const next = () => {
        nextCalled = true;
      };

      adminOnly(req, res, next);
      assert.equal(nextCalled, false);
      assert.equal(statusCode, 403);
    });
  });

});
