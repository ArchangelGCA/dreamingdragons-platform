export const tooltipConfig = {
    placement: 'top',
    offset: 8,
    delay: 0,
    hideDelay: 50,
    arrow: false,
    animation: true,
    animationDuration: 150,
    class: 'text-center w-auto',
    theme: {
        background: 'rgba(0,65,80,0.95)',
        color: '#f0f8ff',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '0.875rem',
        shadow: '0 2px 8px rgba(0,0,0,0.3)',
        maxWidth: '300px',
    },
};

export const getValidatedSession = async (supabase) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) return {session: null};

    try {
        const { data, error } = await supabase.auth.getClaims(session.access_token);

        if (error || !data) {
            return {session: null};
        }

        const { claims } = data;

        return {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: claims.exp,
            expires_in: claims.exp - Math.round(Date.now() / 1000),
            token_type: 'bearer',
            session: {
                user: {
                    app_metadata: claims.app_metadata ?? {},
                    aud: 'authenticated',
                    created_at: '',
                    id: claims.sub,
                    email: claims.email,
                    phone: claims.phone,
                    user_metadata: {
                        //    avatar_url: decoded.user_metadata?.avatar_url,
                        //    nickname: decoded.user_metadata?.nickname,
                    },
                    is_anonymous: claims.is_anonymous
                }
            }
        };
    } catch (err) {
        console.error(err);
        return {session: null};
    }
}