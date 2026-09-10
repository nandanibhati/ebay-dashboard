const cron = require("node-cron");
const AutomatedTask = require("../models/AutomatedTask");
const Task = require("../models/Task");

function pad(n) {
  return String(n).padStart(2, "0");
}

function todayKey(now) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isDue(automatedTask, now) {
  if (automatedTask.frequency === "Daily") return true;

  if (automatedTask.frequency === "Weekly") {
    return automatedTask.weekday === now.getDay();
  }

  if (automatedTask.frequency === "Monthly") {
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const targetDay = Math.min(
      automatedTask.dayOfMonth || 1,
      lastDayOfMonth
    );

    return targetDay === now.getDate();
  }

  return false;
}

async function runScheduler() {
  const now = new Date();
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const today = todayKey(now);

  const dueTasks = await AutomatedTask.find({
    active: true,
    time: currentTime,
    lastGeneratedDate: { $ne: today },
  });

  for (const automatedTask of dueTasks) {
    if (!isDue(automatedTask, now)) continue;

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
