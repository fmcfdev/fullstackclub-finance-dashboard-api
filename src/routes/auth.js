import express from 'express'
import { supabase } from '../supabaseClient.js'
import { prisma } from '../../prisma/prisma.js'
import { TokensGeneratorAdapter } from '../adapters/tokens-generator.js'

const authRouter = express.Router()

authRouter.get('/login/:provider', async (req, res) => {
    const { provider } = req.params

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${process.env.API_URL}/api/auth/callback`,
        },
    })

    if (error) {
        console.error('Erro ao iniciar autenticação:', error)
        return res.status(400).send({ message: 'Falha na autenticação' })
    }

    res.redirect(data.url)
})

authRouter.get('/callback', async (req, res) => {
    const { access_token } = req.query

    console.log(req.query)

    if (!access_token) {
        console.error('Access token não fornecido')
        return res.status(400).send({ message: 'Access token não fornecido' })
    }

    const { data, error } = await supabase.auth.getUser(access_token)

    if (error) {
        console.error('Erro ao obter usuário:', error)
        return res
            .status(400)
            .send({ message: 'Falha ao obter informações do usuário' })
    }

    const user = data.user

    try {
        const provider = user.app_metadata?.provider || 'unknown'

        const savedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                first_name: user.user_metadata.full_name.split(' ')[0],
                last_name: user.user_metadata.full_name.split(' ')[1],
                provider,
                providerId: user.id,
            },
            create: {
                id: user.id,
                email: user.email,
                first_name: user.user_metadata.full_name.split(' ')[0],
                last_name: user.user_metadata.full_name.split(' ')[1],
                password: '',
                provider,
                providerId: user.id,
            },
        })

        console.log('Usuário salvo no banco de dados:', savedUser)

        const tokensGenerator = new TokensGeneratorAdapter()
        const { accessToken, refreshToken } = tokensGenerator.execute(
            savedUser.id,
        )

        return res.status(200).json({
            message: 'Usuário autenticado com sucesso',
            tokens: {
                accessToken,
                refreshToken,
            },
        })
    } catch (err) {
        console.error('Erro ao salvar usuário no banco de dados:', err)
        return res
            .status(500)
            .send({ message: 'Erro interno ao salvar usuário' })
    }
})

export default authRouter
