import React, { useContext } from 'react'; // Importando o context
import AuthContext from '../context/AuthContext';

export default function AdminDashboard(){
    const { logout, user } = useContext(AuthContext);  // Importa a função 'logout' e o Estado 'user'

    return(
        <div>
            <h1>Painel ADMIN</h1>
            {/* O 'user?' é um Optional Chaining Operator, serve para evitar erros de null quando o valor da variável ainda é 'null'*/}
            <p>Bem-Vindo, {user?.email}!</p> 
            <p>Seu perfil é: {user?.perfil}</p>
            <button onClick={logout}>Sair (logout)</button>
        </div>
    );
}