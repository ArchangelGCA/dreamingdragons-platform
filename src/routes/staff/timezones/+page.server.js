export const load = async ({locals: {supabase}}) => {

    const {data: timedata, error } = await supabase
        .from('stafftime')
        .select('username, timezone, country')
        .order('timezone', {ascending: true});

    // Parse timezone local time and use it to sort timedata, timezone has format "America/New_York", then sort by local time
    timedata.forEach((data) => {
        const localTime = new Date().toLocaleString('en-US', {
            timeZone: data.timezone
        });
        data.localTime = new Date(localTime);
    });

    timedata.sort((a, b) => {
        return a.localTime - b.localTime;
    });

    if (error) {
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    // TODO: Find reason why this is running twice
    //console.log('timedata', timedata);

    return {
        index: false,
        timedata,
        title: 'DreamingDragons - Staff Timezones',
        description: 'DreamingDragons Staff Timezones page. Check the current time of our staff members.'
    };
}