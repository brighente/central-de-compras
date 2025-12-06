import React, { useState, useContext } from "react"; 
import AuthContext from "../context/AuthContext"; 
import { useNavigate } from 'react-router-dom'; 

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext); 
    const navigate = useNavigate(); 

    const handleSubmit = async (evento) => { 
        evento.preventDefault(); 
        setError('');
        setLoading(true);

        try{
            const response = await fetch('http://localhost:3001/api/auth/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, senha})
            });

            const data = await response.json(); 

            if(!response.ok){
                throw new Error(data.message || "Erro ao fazer login!");
            }

            setLoading(false);

            if(data.user && data.user.deve_trocar_senha) {
                navigate('/trocar-senha', { state: { token: data.token } });
                return;
            }

            console.log('Login bem sucedido!')
            login(data.token) 

        } catch (err){
            setLoading(false);
            setError(err.message)
        }
    };

    // Componente do Logo Systemac (Ajustado para linha única)
    const LogoSystemac = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '15px' }}>
            {/* Ícone SVG */}
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="24" width="18" height="18" rx="4" fill="var(--cor-sidebar, #334155)" />
                <rect x="22" y="6" width="18" height="18" rx="4" fill="var(--cor-primary, #2563eb)" />
                <path d="M26 24H28C30.2091 24 32 25.7909 32 28V30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            
            {/* Texto Estilizado - Agora na mesma linha */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    color: 'var(--cor-sidebar, #334155)', 
                    letterSpacing: '-1px',
                    textTransform: 'uppercase'
                }}>
                    Syste
                </span>
                <span style={{ 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    color: 'var(--cor-primary, #2563eb)', 
                    letterSpacing: '-1px',
                    textTransform: 'uppercase'
                }}>
                    mac
                </span>
            </div>
        </div>
    );

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', 
            padding: '20px' 
        }}>
        
            {/* CARD DE LOGIN */}
            <div style={{ 
                width: '100%', 
                maxWidth: '420px', 
                backgroundColor: 'var(--cor-branco, #ffffff)', 
                borderRadius: '16px', 
                padding: '40px', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '25px',
                borderTop: '6px solid var(--cor-primary, #2563eb)'
            }}>
                
                {/* CABEÇALHO COM LOGO */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <LogoSystemac />
                    <h2 style={{ 
                        color: '#64748b', 
                        fontSize: '1.1rem', 
                        fontWeight: '500', 
                        marginTop: '5px' 
                    }}>
                        Central de Compras
                    </h2>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                    {/* Campo Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>E-mail Corporativo</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="seu@email.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            style={{ 
                                padding: '14px', 
                                borderRadius: '8px', 
                                border: '2px solid #e2e8f0', 
                                backgroundColor: '#f8fafc',
                                fontSize: '1rem', 
                                outline: 'none', 
                                transition: 'all 0.2s',
                                color: '#334155'
                            }} 
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--cor-primary, #2563eb)';
                                e.target.style.backgroundColor = '#fff';
                                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; 
                            }} 
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = '#f8fafc';
                                e.target.style.boxShadow = 'none';
                            }} 
                        />
                    </div>

                    {/* Campo Senha */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="senha" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>Senha</label>
                        </div>
                        <input 
                            id="senha" 
                            type="password" 
                            placeholder="••••••••" 
                            value={senha} 
                            onChange={e => setSenha(e.target.value)}
                            style={{ 
                                padding: '14px', 
                                borderRadius: '8px', 
                                border: '2px solid #e2e8f0', 
                                backgroundColor: '#f8fafc',
                                fontSize: '1rem', 
                                outline: 'none', 
                                transition: 'all 0.2s',
                                color: '#334155'
                            }} 
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--cor-primary, #2563eb)';
                                e.target.style.backgroundColor = '#fff';
                            }} 
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = '#f8fafc';
                            }} 
                        />
                    </div>

                    {/* Mensagem de Erro */}
                    {error && (
                        <div style={{ 
                            backgroundColor: '#fef2f2', 
                            color: '#ef4444', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            fontSize: '0.9rem', 
                            textAlign: 'center',
                            border: '1px solid #fecaca'
                        }}>
                        {error}
                        </div>
                    )}

                    {/* Botão Entrar */}
                    <button type="submit" disabled={loading}
                    style={{ 
                        backgroundColor: loading ? '#94a3b8' : 'var(--cor-primary, #2563eb)', 
                        color: 'white', 
                        padding: '16px', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        marginTop: '10px', 
                        transition: 'transform 0.1s, background-color 0.2s', 
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        width: '100%',
                        letterSpacing: '0.5px'
                    }} 
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'var(--cor-primary-hover, #1d4ed8)')} 
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'var(--cor-primary, #2563eb)')}
                    onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
                    onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                    >
                        {loading ? 'Autenticando...' : 'ACESSAR PLATAFORMA'}
                    </button>

                </form>

                {/* Rodapé do Card */}
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>
                    Systemac v1.0 • Gestão de Materiais
                </div>

            </div>
        </div>
    );
}

export default LoginPage;