// Payday is 15 days after an employee's joining date, recurring every
// month on that same day-of-month (matches the "Salary Date" already
// shown on the Employees page — this just makes it check "is that day
// of the month today", not just the one-time date right after joining).
export function getSalaryPayDay(joiningDate) {
  if (!joiningDate) return null;
  const d = new Date(joiningDate);
  if (isNaN(d)) return null;
  d.setDate(d.getDate() + 15);
  return d.getDate();
}

export function isSalaryPaidThisMonth(employee, now = new Date()) {
  return (
    employee.lastSalaryPaidMonth === now.getMonth() + 1 &&
    employee.lastSalaryPaidYear === now.getFullYear()
  );
}

export function isSalaryDueToday(employee, now = new Date()) {
  const payDay = getSalaryPayDay(employee.joiningDate);
  if (!payDay) return false;
  return payDay === now.getDate() && !isSalaryPaidThisMonth(employee, now);
}
