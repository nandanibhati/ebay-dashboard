const cron = require("node-cron");
const AutomatedTask = require("../models/AutomatedTask");
const Task = require("../models/Task");

// The server (Render) runs in UTC regardless of where the team actually is,
// so "today"/"now" must be pinned to the business's real timezone (India) —
// same reasoning as attendanceRoutes.js — or a task scheduled for "09:00"
// IST would actually fire around 14:30 IST on a UTC host.
const BUSINESS_TIMEZONE = "Asia/Kolkata";
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getBusinessTimeParts(now) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  })
    .formatToParts(now)
    .reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Some ICU implementations render midnight as "24" with hour12:false.
    hour: parts.hour === "24" ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
    weekday: WEEKDAY_INDEX[parts.weekday],
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function isDue(automatedTask, parts) {
  if (automatedTask.frequency === "Daily") return true;

  if (automatedTask.frequency === "Weekly") {
    return automatedTask.weekday === parts.weekday;
  }

  if (automatedTask.frequency === "Monthly") {
    // Last day of this business-calendar month, computed via UTC math so
    // it isn't skewed by the server's own timezone.
    const lastDayOfMonth = new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate();

    const targetDay = Math.min(automatedTask.dayOfMonth || 1, lastDayOfMonth);

    return targetDay === parts.day;
  }

  return false;
}

async function runScheduler() {
  const parts = getBusinessTimeParts(new Date());
  const currentTime = `${pad(parts.hour)}:${pad(parts.minute)}`;
  const today = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;

  // Any time at or before now (not just this exact minute), so a run missed
  // while the server was asleep or restarting is caught up later the same
  // day. "HH:MM" strings compare correctly as text.
  const dueTasks = await AutomatedTask.find({
    active: true,
    time: { $lte: currentTime },
    lastGeneratedDate: { $ne: today },
  });

  for (const automatedTask of dueTasks) {
    if (!isDue(automatedTask, parts)) continue;

    // Claim today's run atomically so overlapping scheduler ticks can't
    // generate the same task twice.
    const claimed = await AutomatedTask.updateOne(
      { _id: automatedTask._id, lastGeneratedDate: { $ne: today } },
      { lastGeneratedDate: today }
    );
    if (claimed.modifiedCount === 0) continue;

    // One separate task per assignee, so each person tracks their own
    // status and ATC. If that fails, release the claim so the next tick
    // retries instead of silently skipping today.
    await Task.insertMany(
      automatedTask.assignedTo.filter(Boolean).map((assignee) => ({
        title: automatedTask.title,
        description: automatedTask.description,
        group: automatedTask.group,
        assignedBy: automatedTask.assignedBy,
        assignedTo: assignee,
        priority: automatedTask.priority,
        status: "Todo",
        startDate: today,
        dueDate: today,
        progress: 0,
        etcMinutes: automatedTask.etcMinutes,
        l1: automatedTask.l1,
        l2: automatedTask.l2,
        trainingLink: automatedTask.trainingLink,
        videoLink: automatedTask.videoLink,
        formLink: automatedTask.formLink,
        formReportLink: automatedTask.formReportLink,
        checklistLink: automatedTask.checklistLink,
        screenshot: automatedTask.image,
        sourceAutomatedTask: automatedTask._id,
      }))
    ).catch(async (error) => {
      await AutomatedTask.updateOne(
        { _id: automatedTask._id },
        { lastGeneratedDate: automatedTask.lastGeneratedDate }
      );
      throw error;
    });
  }
}

// A task past its due date that was never marked Done/Closed counts as
// Missed and moves to Archived Tasks automatically, instead of sitting
// around indefinitely on the active board.
async function archiveMissedTasks() {
  const parts = getBusinessTimeParts(new Date());
  const today = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;

  await Task.updateMany(
    {
      isDeleted: { $ne: true },
      dueDate: { $type: "string", $ne: "", $lt: today },
      status: { $nin: ["Done", "Closed"] },
    },
    {
      isDeleted: true,
      deletedBy: "Missed (Auto-Archived)",
      deletedAt: new Date(),
    }
  );
}

function startTaskScheduler() {
  cron.schedule("* * * * *", () => {
    runScheduler().catch((error) => {
      console.log("Task scheduler error:", error.message);
    });

    archiveMissedTasks().catch((error) => {
      console.log("Missed-task archiver error:", error.message);
    });
  });

  console.log("Automated task scheduler started ⏰");
}

module.exports = { startTaskScheduler };
