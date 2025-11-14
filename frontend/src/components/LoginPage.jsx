import React, { useState, useContext } from "react"; // Ferramentas para poder usar Estado e Context
import AuthContext from "../context/AuthContext";  // Importamos nosso Context (cerebro)

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);  // Pegamos a função de login do nosso Context

    const handleSubmit = async (evento) => {  // Criamos a função handleSubmit, que fará as ações relacionadas ao envio do formulário de login
        evento.preventDefault();  // Evita de recarregar a página quando for enviado o formulário
        setError('');
        setLoading(true);

        try{
            const response = await fetch('http://localhost:3001/api/login', {  // Enviamos um json de login para a rota de login no backend
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
            console.log("LOGIN BEM SUCEDIDO!");
            login(data.token) // Chama a função login do AuthContext, que salva o token no localStorage e no Estado

        } catch (err){
            setLoading(false);
            setError(err.message)
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="emailInp">Email:</label>
                    <input type="email" id="emailInp" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="senhaInp">Senha:</label>
                    <input type="password" id="senhaInp" value={senha} onChange={e => setSenha(e.target.value)} />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            </form>
        </div>
    );
}

export default LoginPage;