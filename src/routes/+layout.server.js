export const load = async ({locals: {getSession}}) => {
    const {session, user} = await getSession();

    return {
        session,
        user
    };
};