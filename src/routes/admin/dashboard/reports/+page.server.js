import {error as errorx} from "@sveltejs/kit";
import {isAdmin} from "$lib/utils/misc.js";

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();
    let maxUsers = 1000000;
    const pageData = {
        title: 'Admin - Reports',
        description: 'Admin Reports Dashboard of DreamingDragons platform.',
        index: false
    }

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    const {data: reports, error: reportsError} = await supabase
        .from('reports')
        .select('id,report_type,report_description,book_id,chapter_id,is_closed,created_at,user_id,profiles!reports_user_id_fkey(id,username,avatar_url)')
        .order('created_at', {ascending: false});

    if (reportsError) {
        console.error(reportsError);
        return errorx(500, "Error fetching reports");
    }

    if (!reports || reports.length === 0) {
        return {
            ...pageData,
            reports: []
        }
    } else {

        const closedReports = reports.filter((r) => r.is_closed === true);
        const openReports = reports.filter((r) => r.is_closed === false);

        return {
            ...pageData,
            openReports,
            closedReports
        }
    }
}

export const actions = {
    close_report: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
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