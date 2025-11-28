import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function TrocarSenha(){
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const tokenTemporario = location.state?.token;

    useEffect(() => {
        if(!tokenTemporario){
            navigate("/login");
        }
    }, [tokenTemporario, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if(novaSenha !== confirmarSenha){
            setError("As senhas não coincidem!");
            return
        }

        if(novaSenha.length < 6){
            setError("A senha deve conter pelo menos 6 caracteres.")
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/auth/definir-senha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenTemporario}`
                },
                body: JSON.stringify({ novaSenha })
            });

            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message || "Erro ao definir senha");
            }

            alert("Senha definida com sucesso.")

            login(tokenTemporario);
        } catch(err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#d32f2f', fontSize: '1.5rem', fontWeight: '700' }}>⚠️ Troca Obrigatória</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                        Por segurança, você deve definir uma nova senha no primeiro acesso.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}> Nova Senha </label>
                        <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Confirmar Nova Senha</label>
                        <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                    </div>

                    {error && (
                        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}> {error} </div>
                    )}

                    <button type="submit" disabled={loading}
                        style={{ backgroundColor: '#d32f2f', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                        {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}