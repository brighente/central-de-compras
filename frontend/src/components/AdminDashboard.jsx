import React, { useContext } from 'react'; // Importando o context
import AuthContext from '../context/AuthContext';

export default function AdminDashboard(){
    const { logout, authState } = useContext(AuthContext);  // Pega a função logout e o estado de auth

    return(
        <div>
            <h1>Painel ADMIN</h1>
            {/* O 'user?' é um Optional Chaining Operator, serve para evitar erros de null quando o valor da variável ainda é 'null'*/}
            <p>Bem-Vindo, {authState.user?.email}!</p> 
            <p>Seu perfil é: {authState.user?.perfil}</p>
            <button onClick={logout}>Sair (logout)</button>
        </div>
    );
}