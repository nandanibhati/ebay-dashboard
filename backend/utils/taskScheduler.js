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

  const dueTasks = await AutomatedTask.find({
    active: true,
    time: currentTime,
    lastGeneratedDate: { $ne: today },
  });

  for (const automatedTask of dueTasks) {
    if (!isDue(automatedTask, parts)) continue;

    await Task.create({
      title: automatedTask.title,
      description: automatedTask.description,
      group: automatedTask.group,
      assignedBy: automatedTask.assignedBy,
      assignedTo: automatedTask.assignedTo,
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
    });

    automatedTask.lastGeneratedDate = today;
    await automatedTask.save();
  }
}

function startTaskScheduler() {
  cron.schedule("* * * * *", () => {
    runScheduler().catch((error) => {
      console.log("Task scheduler error:", error.message);
    });
  });

  console.log("Automated task scheduler started ⏰");
}

module.exports = { startTaskScheduler };
