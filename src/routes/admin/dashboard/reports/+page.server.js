import {error as errorx} from "@sveltejs/kit";

async function isAdmin(session, supabase) {
    if (!session) {
        return errorx(401, "Unauthorized");
    }

    /* Role IDs (AS OF NOW):
    / 2 - moderator
    / 3 - admin (FULL PERMS)
    / 4 - staff
     */
    const {data: data, error} = await supabase
        .from('roles_profile')
        .select('role_id')
        .eq('user_id', session.user.id)
        .eq('role_id', 3);

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching profile");
    }

    if (!data || data.length === 0) {
        return errorx(401, "Unauthorized");
    }

    return true;
}

export const load = async ( { locals: { supabase, getSession } }) => {
    const session = await getSession();
    let maxUsers = 1000000;

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    const {data: reports, error: reportsError} = await supabase
        .from('reports')
        .select('*')
        .order('created_at', {ascending: false});

    if (reportsError) {
        console.error(reportsError);
        return errorx(500, "Error fetching reports");
    }

    if (!reports || reports.length === 0) {
        return {
            reports: []
        }
    } else {

        const closedReports = reports.filter((r) => r.is_closed === true);
        const openReports = reports.filter((r) => r.is_closed === false);

        return {
            openReports,
            closedReports
        }
    }
}

export const actions = {
    close_report: async ({request, locals: {supabase, getSession}}) => {
        const session = await getSession();
        const formData = Object.fromEntries(await request.formData());

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const reportId = formData.report_id;

        if (reportId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { error} = await supabase
            .from('reports')
            .update({is_closed: true})
            .eq('id', reportId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: "Error closing report"
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Report closed"
            }
        }
    }
}