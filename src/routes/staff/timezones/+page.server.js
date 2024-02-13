export const load = async ({locals: {supabase}}) => {
    const {data: timedata, error } = await supabase
        .from('stafftime')
        .select('username, timezone, country')
        .order('username', {ascending: true});

    if (error) {
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    return {timedata};
}