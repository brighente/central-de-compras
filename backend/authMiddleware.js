const jwt = require('jsonwebtoken');

const JWT_SECRET = 'projeto-central-compras-abacate';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization; // Pega o token que vem do header -> 'Bearer tokenFicaAqui'

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: 'Acesso Negado! Nenhum token foi fornecido.'});
    }

    const token = authHeader.split(' ')[1]; // Pega o toke que fica depois do 'Bearer '

    try{
        const decoded = jwt.verify(token, JWT_SECRET); // Valida o token a partir do JWT_SECRET

        req.user = decoded; // Com o token decodificado, os dados do usuário são anexados na requisição para a próxima rota sabe quem é o user

        next(); 
    } catch(err){
        res.status(401).json({message: 'Token Inválido'});
    }
};

module.exports = authMiddleware;