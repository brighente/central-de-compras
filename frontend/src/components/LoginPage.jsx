import React, {useState} from "react";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setError('');
        setLoading(true);

        try{
            const response = await fetch('http://localhost:3001/api/login', {
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
            console.log("LOGIN BEM SUCEDIDO!");
            console.log("Token reconhecido: ", data.token);
            alert('Login feito com sucesso! Token no console.');
            localStorage.setItem('authToken', data.token);

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