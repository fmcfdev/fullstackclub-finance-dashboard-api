import { Prisma, TransactionType } from '@prisma/client'
import { prisma } from '../../../../prisma/prisma.js'

export class PostgresGetUserBalanceRepository {
    async execute(userId, from, to) {
        const dateFilter = {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            },
        }
        const {
            _sum: { amount: totalExpenses },
        } = await prisma.transaction.aggregate({
            where: {
                user_id: userId,
                type: TransactionType.EXPENSE,
                ...dateFilter,
            },
            _sum: {
                amount: true,
            },
        })

        const {
            _sum: { amount: totalEarnings },
        } = await prisma.transaction.aggregate({
            where: {
                user_id: userId,
                type: TransactionType.EARNING,
                ...dateFilter,
            },
            _sum: {
                amount: true,
            },
        })

        const {
            _sum: { amount: totalInvestments },
        } = await prisma.transaction.aggregate({
            where: {
                user_id: userId,
                type: TransactionType.INVESTMENT,
                ...dateFilter,
            },
            _sum: {
                amount: true,
            },
        })

        const _totalEarnings = totalEarnings || new Prisma.Decimal(0)
        const _totalExpenses = totalExpenses || new Prisma.Decimal(0)
        const _totalInvestments = totalInvestments || new Prisma.Decimal(0)

        const balance = new Prisma.Decimal(
            _totalEarnings - _totalExpenses - _totalInvestments,
        )

        return {
            earnings: _totalEarnings,
            expenses: _totalExpenses,
            investments: _totalInvestments,
            balance,
        }
    }
}
