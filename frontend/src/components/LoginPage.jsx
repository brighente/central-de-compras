import React, { useState, useContext } from "react"; // Ferramentas para poder usar Estado e Context
import AuthContext from "../context/AuthContext";  // Importamos nosso Context (cerebro)
import { useNavigate } from 'react-router-dom';  // Importa o navigate

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);  // Pegamos a função de login do nosso Context
    const navigate = useNavigate(); // Inicializa o hook para usar o navigate

    const handleSubmit = async (evento) => {  // Criamos a função handleSubmit, que fará as ações relacionadas ao envio do formulário de login
        evento.preventDefault();  // Evita de recarregar a página quando for enviado o formulário
        setError('');
        setLoading(true);

        try{
            const response = await fetch('http://localhost:3001/api/auth/login', {  // Enviamos um json de login para a rota de login no backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, senha})
            });

            const data = await response.json(); // Transformamos a resposta em json

            if(!response.ok){
                throw new Error(data.message || "Erro ao fazer login!");
            }

            setLoading(false);

            if(data.user && data.user.deve_trocar_senha) {
                navigate('/trocar-senha', { state: { token: data.token } });
                return;
            }

            console.log('Login bem sucedido!')
            login(data.token) // Chama a função login do AuthContext, que salva o token no localStorage e no Estado

        } catch (err){
            setLoading(false);
            setError(err.message)
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cor-fundo)', padding: '20px' }}>
        
            {/* CARD DE LOGIN */}
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--cor-branco)', borderRadius: '12px', padding: '40px', boxShadow: 'var(--sombra-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* CABEÇALHO DO CARD */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ color: 'var(--cor-sidebar)', fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Bem-vindo</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Insira suas credenciais para acessar</p>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                    {/* Campo Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--cor-sidebar)' }}>E-mail</label>
                        <input id="email"type="email" placeholder="exemplo@email.com" value={email} onChange={e => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--cor-borda)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--cor-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--cor-borda)'} />
                    </div>

                    {/* Campo Senha */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label htmlFor="senha" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--cor-sidebar)' }}>Senha</label>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--cor-primary)', textDecoration: 'none' }}>Esqueceu a senha?</a>
                        </div>
                        <input id="senha" type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--cor-borda)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--cor-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--cor-borda)'} />
                    </div>

                    {/* Mensagem de Erro */}
                    {error && (
                        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                        </div>
                    )}

                    {/* Botão Entrar */}
                    <button type="submit" disabled={loading}
                    style={{ backgroundColor: loading ? '#ccc' : 'var(--cor-primary)', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', marginTop: '10px', transition: 'background-color 0.2s', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }} onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'var(--cor-primary-hover)')} onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'var(--cor-primary)')}>
                        {loading ? 'Carregando...' : 'Entrar na Plataforma'}
                    </button>

                </form>

                {/* Rodapé do Card */}
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#888', marginTop: '10px' }}>
                    Central de Compras © 2025
                </div>

            </div>
        </div>
    );
}

export default LoginPage;