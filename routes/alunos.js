// app/(main)/alunos/page.js

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. PRECISAMOS IMPORTAR O HOOK
import { toast } from 'react-hot-toast';
import styles from './alunos.module.css';
// O modal não é mais usado aqui, podemos remover o import se quisermos
// import AlunoModal from '@/components/AlunoModal'; 
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

export default function AlunosPage() {
  const router = useRouter(); // <-- 2. PRECISAMOS INICIAR O ROUTER AQUI

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Seus estados de busca
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaBusca, setCategoriaBusca] = useState('nome');

  const { isAuthenticated } = useAuth();

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alunos');
      setAlunos(response.data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Não foi possível carregar a lista de alunos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlunos();
    }
  }, [isAuthenticated]);

  const alunosFiltrados = alunos.filter(aluno => {
    if (!termoBusca) return true;
    const buscaLowerCase = termoBusca.toLowerCase();
    switch (categoriaBusca) {
      case 'id': return String(aluno.id).includes(termoBusca);
      case 'matricula': return String(aluno.matricula).toLowerCase().includes(buscaLowerCase);
      case 'cpf': return aluno.cpf?.includes(termoBusca);
      case 'nome': default: return aluno.nome.toLowerCase().includes(buscaLowerCase);
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gerenciamento de Alunos</h1>
        {/* Agora este botão vai funcionar, pois a variável 'router' existe */}
        <button onClick={() => router.push('/alunos/novo')} className={styles.newStudentButton}>
          + Novo Aluno
        </button>
      </header>
      
      {/* Container de Busca */}
      <div className={styles.searchContainer}>
        <select
          className={styles.searchCategory}
          value={categoriaBusca}
          onChange={(e) => setCategoriaBusca(e.target.value)}
        >
          <option value="nome">Nome</option>
          <option value="id">ID</option>
          <option value="matricula">Matrícula</option>
          <option value="cpf">CPF</option>
        </select>
        <input
          type="text"
          placeholder={`Buscar por ${categoriaBusca}...`}
          className={styles.searchBar}
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
      </div>

      {/* Container da Tabela */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Matrícula</th>
              <th>Nome Completo</th>
              <th>CPF</th>
              <th>Status Anamnese</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6">Carregando alunos...</td></tr>
            ) : alunosFiltrados.length === 0 ? (
              <tr><td colSpan="6">Nenhum aluno encontrado. Clique em "+ Novo Aluno" para começar.</td></tr>
            ) : (
              alunosFiltrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.id}</td>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.nome}</td>
                  <td>{aluno.cpf || 'N/A'}</td>
                  <td>{aluno.anamneseStatus}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={`${styles.actionButton} ${styles.editButton}`}>Editar</button>
                      <button className={`${styles.actionButton} ${styles.deleteButton}`}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}