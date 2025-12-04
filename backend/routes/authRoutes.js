const express = require('express');
const router = express.Router();
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const authMiddleware = require('../authMiddleware');

const JWT_SECRET = 'projeto-central-compras-abacate';

router.post('/login', async (req,res) => {
    console.log("LOG: Recebi uma tentativa de login");

    const {email, senha} = req.body;

    if(!email || !senha){
        return res.status(400).json({message: 'Email e senha são obrigatórios.'});
    }

    try {
        const usuario = await db('tb_sistema_usuario AS user')
        .join('tb_sistema_usuario_perfil as profile', 'user.id', 'profile.id_usuario')
        .where({ email: email})
        .select('user.id', 'user.email', 'user.senha', 'profile.perfil', 'user.deve_trocar_senha').first();

        if(!usuario){
            return res.status(401).json({message: 'Email ou senha inválidos!'})
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if(!senhaCorreta){
            return res.status(401).json({message: 'Email ou senha inválidos!'})
        }

        const token = jwt.sign(
            {
                userId: usuario.id,
                email: usuario.email,
                perfil: usuario.perfil
            },
            JWT_SECRET,
            {
                expiresIn: '1h'    
            }
        );

        console.log("LOG: Login bem sucedido para:", email);
        res.json({
            message: 'Login bem sucedido!',
            token,
            user: {
                id: usuario.id,
                email: usuario.email,
                deve_trocar_senha: usuario.deve_trocar_senha
            }
        });

    } catch (err){
        console.error("Erro no login: ", err);
        res.status(500).json({message: 'Erro interno no servidor!'});
    }
});

router.post('/definir-senha', authMiddleware, async (req, res) => {
    const { novaSenha } = req.body;
    const userId = req.user.userId;

    if(!novaSenha || novaSenha.length < 6){
        return res.status(400).json({ message: 'Senha inválida' });
    }

    try {
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await db('tb_sistema_usuario').where({ id: userId }).update({
            senha: senhaHash,
            deve_trocar_senha: false
        });

        res.json({ message: 'Senha atualizada com sucesso! '});
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
})

module.exports = router;