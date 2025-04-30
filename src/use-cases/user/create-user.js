import { EmailAlreadyInUseError } from '../../errors/user.js'
import { generateRandomPassword } from '../../utils/passwordGenerator.js'

export class CreateUserUseCase {
    constructor(
        getUserByEmailRepository,
        createUserRepository,
        passwordHasherAdapter,
        idGeneratorAdapter,
        tokensGeneratorAdapter,
    ) {
        this.getUserByEmailRepository = getUserByEmailRepository
        this.createUserRepository = createUserRepository
        this.passwordHasherAdapter = passwordHasherAdapter
        this.idGeneratorAdapter = idGeneratorAdapter
        this.tokensGeneratorAdapter = tokensGeneratorAdapter
    }

    async execute(createUserParams) {
        const userWithProvidedEmail =
            await this.getUserByEmailRepository.execute(createUserParams.email)

        if (userWithProvidedEmail) {
            throw new EmailAlreadyInUseError(createUserParams.email)
        }

        const userId = this.idGeneratorAdapter.execute()

        const password =
            createUserParams.provider && createUserParams.providerId
                ? generateRandomPassword()
                : createUserParams.password

        const hashedPassword =
            await this.passwordHasherAdapter.execute(password)

        const user = {
            ...createUserParams,
            id: userId,
            password: hashedPassword,
        }

        const createdUser = await this.createUserRepository.execute(user)

        const { accessToken, refreshToken } =
            this.tokensGeneratorAdapter.execute(userId)

        return {
            ...createdUser,
            tokens: {
                accessToken,
                refreshToken,
            },
        }
    }
}
