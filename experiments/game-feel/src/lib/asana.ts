import { Task, Sprint, SprintName, PendingChange } from '@/types';
import { parseSprintDates } from './dateUtils';

interface AsanaTask {
    gid: string;
    name: string;
    assignee: { name: string } | null;
    custom_fields: {
        gid: string;
        name: string;
        type: string;
        number_value?: number;
        multi_enum_values?: { name: string; gid: string }[];
        enum_value?: { name: string; gid: string };
        display_value?: string;
    }[];
    memberships: {
        section: { name: string; gid: string };
        project: { name: string; gid: string };
    }[];
    completed: boolean;
    html_notes?: string;
    notes?: string;
    permalink_url?: string;
}

export async function fetchAsanaData(
    token: string,
    projectGid: string,
    sprintFieldId: string | null, // If null, we'll try to find "Sprints"
    pointsFieldId: string | null, // If null, we'll try to find "datapoints"
    sprintCount: number = 6
): Promise<{ sprints: Sprint[]; tasks: Task[] }> {

    // 1. Fetch Tasks with relevant fields
    const url = `https://app.asana.com/api/1.0/projects/${projectGid}/tasks?opt_fields=name,assignee.name,completed,memberships.section.name,memberships.project.gid,memberships.project.name,custom_fields.gid,custom_fields.name,custom_fields.type,custom_fields.number_value,custom_fields.multi_enum_values.name,custom_fields.display_value,html_notes,notes,permalink_url`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Asana API Error: ${response.statusText}`);
    }

    const json = await response.json();
    console.log('Asana Fetch Debug:', {
        taskCount: json.data?.length,
        firstTaskKeys: json.data?.[0] ? Object.keys(json.data[0]) : [],
        firstTaskHtml: json.data?.[0]?.html_notes,
        firstTaskNotes: json.data?.[0]?.notes
    });
    const asanaTasks: AsanaTask[] = json.data;

    // 2. Identify Sprints and Map Tasks
    const localTasks: Task[] = [];
    const sprintMap = new Map<string, { name: string; capacity: number }>();

    // Helper to find field value
    const getCustomField = (task: AsanaTask, gid: string | null, nameFallback: string) => {
        return task.custom_fields.find(f =>
            (gid && f.gid === gid) ||
            (!gid && f.name.toLowerCase().includes(nameFallback.toLowerCase()))
        );
    };

    asanaTasks.forEach(t => {
        // --- Status (Section) ---
        // Assuming the project has only one membership relevant here (or check projectGid)
        const membership = t.memberships.find(m => m.project.gid === projectGid) || t.memberships[0];
        const sectionName = membership ? membership.section.name : 'Unknown';

        let status: Task['status'] = 'To Do';
        if (t.completed) {
            status = 'Done';
        } else {
            // Refined mapping based on section name
            const lowerSec = sectionName.toLowerCase();
            if (lowerSec.includes('backlog')) status = 'Backlog';
            else if (lowerSec.includes('done') || lowerSec.includes('complete')) status = 'Done';
            else if (lowerSec.includes('progress') || lowerSec.includes('doing')) status = 'In Progress';
            else status = 'To Do';
        }

        // --- Points ---
        const pointsField = getCustomField(t, pointsFieldId, 'datapoints');
        const points = pointsField ? (pointsField.number_value || 5) : 5; // Default to 5 points per user request

        // --- Sprint ---
        const sprintField = getCustomField(t, sprintFieldId, 'Sprints');
        let sprintName: SprintName | null = null;

        if (sprintField && sprintField.multi_enum_values && sprintField.multi_enum_values.length > 0) {
            // Strategy: Take the LAST sprint in the list (assuming chronological order in Asana usually?)
            // Or sort them. For now, let's take the last one as "latest".
            const sprintVal = sprintField.multi_enum_values[sprintField.multi_enum_values.length - 1];
            sprintName = sprintVal.name;
        }

        // --- Assignee ---
        const assignee = t.assignee ? t.assignee.name : undefined;

        // Create Task
        localTasks.push({
            id: t.gid,
            title: t.name,
            sprint: sprintName,
            status: sprintName ? status : 'Backlog', // Force backlog if no sprint? Or keep status? 
            // If it has a sprint, it goes in the sprint column. If no sprint, it goes to backlog.
            points: points,
            assignee: assignee,
            description: t.html_notes || t.notes, // Prefer HTML, fallback to plain text
            permalink_url: t.permalink_url
        });

        // Collect Sprints
        if (sprintName) {
            if (!sprintMap.has(sprintName)) {
                sprintMap.set(sprintName, { name: sprintName, capacity: 50 }); // Default capacity
            }
        }
    });

    // Sort sprints naturally
    let sortedSprints = Array.from(sprintMap.values()).map(s => ({
        ...s,
        dates: parseSprintDates(s.name)
    })).sort((a, b) => {
        // Sort by Date if available, else Name
        if (a.dates && b.dates) return a.dates.start.getTime() - b.dates.start.getTime();
        return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

    // Smart Selection: Find "Current" and Next N
    if (sprintCount > 0 && sortedSprints.length > 0) {
        const today = new Date();
        // Remove time component for accurate comparison
        today.setHours(0, 0, 0, 0);

        // Find index of the "Active" sprint (Start <= Today <= End)
        // OR the first upcoming sprint (Start > Today)
        let startIndex = sortedSprints.findIndex(s => {
            if (!s.dates) return false;
            // Active?
            if (s.dates.start <= today && s.dates.end >= today) return true;
            // Upcoming? (We want the first one that is upcoming if no active one exists)
            // But findIndex stops at first true. 
            // So if we iterate, the first one where end >= today is a good candidate?
            // Actually: We want the first sprint where EndDate >= Today.
            // This covers "Active" (End >= Today) and "Future" (End > Start > Today).
            // It filters out "Past" (End < Today).
            return s.dates.end >= today;
        });

        if (startIndex !== -1) {
            // Found a starting point! 
            sortedSprints = sortedSprints.slice(startIndex, startIndex + sprintCount);
        } else {
            // No current/future dates found? Or parsing failed?
            // Fallback: Take the Last N (as before)
            sortedSprints = sortedSprints.slice(-sprintCount);
        }
    }

    // Create Set of allowed sprint names
    const allowedSprintNames = new Set(sortedSprints.map(s => s.name));

    // Convert to Sprint objects
    const sprints: Sprint[] = sortedSprints.map(s => ({
        name: s.name,
        capacity: s.capacity,
        assigneeCapacities: {}
    }));

    // Filter tasks: Keep tasks that are in the allowed sprints OR are in Backlog (if we want backlog?)
    // Actually, usually if we import sprints, we might only want tasks IN those sprints.
    // But if a task has no sprint, it goes to Backlog.
    // Let's keep tasks that match the sprints, PLUS backlog tasks (no sprint).
    // User said "select tasks within a number of sprints". This implies *only* those tasks.
    // So if a task is in "Sprint Old", it should be ignored.
    // If a task is "Backlog" (no sprint), we might keep it? 
    // Let's filter strictly to tasks that belong to the selected sprints to keep it clean.

    const relevantTasks = localTasks.filter(t =>
        (t.sprint && allowedSprintNames.has(t.sprint)) || t.status === 'Backlog'
    );

    return { sprints, tasks: relevantTasks };
}

export async function batchUpdateTasks(
    token: string,
    changes: PendingChange[],
    projectGid: string
): Promise<void> {
    if (changes.length === 0) return;

    // 1. Fetch Metadata (Sections & Custom Fields) to map values
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    // Parallel fetch
    const [sectionsRes, customFieldsRes] = await Promise.all([
        fetch(`https://app.asana.com/api/1.0/projects/${projectGid}/sections`, { headers }),
        fetch(`https://app.asana.com/api/1.0/projects/${projectGid}/custom_field_settings`, { headers })
    ]);

    if (!sectionsRes.ok || !customFieldsRes.ok) {
        throw new Error("Failed to fetch project metadata for sync");
    }

    const sectionsData = await sectionsRes.json();
    const cfData = await customFieldsRes.json();

    // Map: Name -> GID
    const sectionsMap: Record<string, string> = {};
    sectionsData.data.forEach((s: any) => {
        sectionsMap[s.name.toLowerCase()] = s.gid;
    });

    // Helpers to find IDs
    const findSectionGid = (status: string) => {
        // Map our statuses to simplified section keywords
        const lower = status.toLowerCase();
        if (lower === 'backlog') return sectionsMap['backlog'] || Object.values(sectionsMap)[0]; // Fallback?
        if (lower === 'to do') return sectionsMap['to do'] || sectionsMap['todo'];
        if (lower === 'in progress') return sectionsMap['in progress'] || sectionsMap['doing'];
        if (lower === 'done') return sectionsMap['done'] || sectionsMap['complete'];
        return undefined;
    };

    const pointsField = cfData.data.find((cf: any) => cf.custom_field.name.toLowerCase().includes('datapoints'));
    const pointsGid = pointsField?.custom_field.gid;

    const sprintField = cfData.data.find((cf: any) => cf.custom_field.name.toLowerCase().includes('sprints'));
    const sprintGid = sprintField?.custom_field.gid;
    const sprintEnumOptions = sprintField?.custom_field.enum_options || []; // Map Name -> GID

    const findSprintEnumGid = (sprintName: string) => {
        const option = sprintEnumOptions.find((o: any) => o.name === sprintName);
        return option?.gid;
    };

    // 2. Group changes by Task ID
    const changesByTask: Record<string, PendingChange[]> = {};
    const createdTasks: PendingChange[] = [];

    changes.forEach(c => {
        if (c.field === 'created') {
            createdTasks.push(c);
        } else {
            if (!changesByTask[c.taskId]) changesByTask[c.taskId] = [];
            changesByTask[c.taskId].push(c);
        }
    });

    // 3. Process Creations
    for (const creation of createdTasks) {
        // Find if there are subsequent updates for this new task
        const updates = changesByTask[creation.taskId] || [];

        // Aggregate initial state
        let title = creation.taskTitle;
        let points = 0;
        let status = 'Backlog';
        let sprint = null;
        let description = '';

        updates.forEach(u => {
            if (u.field === 'title') title = u.newValue;
            if (u.field === 'points') points = u.newValue;
            if (u.field === 'status') status = u.newValue;
            if (u.field === 'sprint') sprint = u.newValue;
            if (u.field === 'description') description = u.newValue;
        });

        const custom_fields: Record<string, any> = {};
        if (pointsGid) custom_fields[pointsGid] = points;
        if (sprintGid && sprint) {
            const enumId = findSprintEnumGid(sprint);
            if (enumId) custom_fields[sprintGid] = enumId;
        }

        const body: any = {
            data: {
                name: title,
                projects: [projectGid],
                custom_fields,
                html_notes: description ? `<body>${description}</body>` : undefined
            }
        };

        // Create Task
        const createRes = await fetch(`https://app.asana.com/api/1.0/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (createRes.ok) {
            const json = await createRes.json();
            const newGid = json.data.gid;

            // Move to correct section
            const sectionGid = findSectionGid(status);
            if (sectionGid) {
                await fetch(`https://app.asana.com/api/1.0/sections/${sectionGid}/addTask`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ data: { task: newGid } })
                });
            }
        }
    }

    // 4. Process Updates for existing tasks
    // Remove "created" tasks from this loop effectively by checking existing map keys
    // (Note: newly created tasks were handled above, but their 'updates' were just merged. 
    // We should NOT process the temporary ID in the updates loop. 
    // Wait, the taskId in 'changesByTask' for a new task is the TEMP ID.
    // The loop 'createdTasks' used that temp ID.
    // So we should delete those keys from 'changesByTask' to avoid 404s on the temp ID.)

    createdTasks.forEach(c => {
        delete changesByTask[c.taskId];
    });

    const updatePromises = Object.keys(changesByTask).map(async (taskId) => {
        const taskChanges = changesByTask[taskId];
        if (taskChanges.length === 0) return;

        // Aggregate changes
        const data: any = {};
        const custom_fields: Record<string, any> = {};
        let sectionToMoveTo: string | undefined = undefined;

        taskChanges.forEach(c => {
            if (c.field === 'title') data.name = c.newValue;
            if (c.field === 'description') data.html_notes = `<body>${c.newValue}</body>`;
            if (c.field === 'points' && pointsGid) custom_fields[pointsGid] = c.newValue;
            if (c.field === 'sprint' && sprintGid) {
                const enumId = findSprintEnumGid(c.newValue);
                if (enumId) custom_fields[sprintGid] = enumId;
            }
            if (c.field === 'status') {
                sectionToMoveTo = findSectionGid(c.newValue);
            }
        });

        if (Object.keys(custom_fields).length > 0) {
            data.custom_fields = custom_fields;
        }

        // Apply Update
        if (Object.keys(data).length > 0) {
            await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ data })
            });
        }

        // Apply Move
        if (sectionToMoveTo) {
            await fetch(`https://app.asana.com/api/1.0/sections/${sectionToMoveTo}/addTask`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ data: { task: taskId } })
            });
        }
    });

    await Promise.all(updatePromises);
}
